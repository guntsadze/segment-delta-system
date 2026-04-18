import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { DeltaService } from '../delta/delta.service';
import { EvaluationProducer } from './evaluation.producer';
import { DeltaGateway } from 'src/gateway/delta.gateway';
import { PrismaService } from 'prisma/prisma.service';
import { getLogType } from 'src/common/utils/log-helper';

// ვიღებთ დავცალებას რიგიდან
@Processor('segment-evaluation')
export class EvaluationProcessor extends WorkerHost {
  constructor(
    private deltaService: DeltaService,
    private producer: EvaluationProducer,
    private gateway: DeltaGateway,
    private readonly prisma: PrismaService,
    @InjectQueue('campaign-notifications') private campaignQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<{ segmentId: string; triggeredBy: string }>) {
    const { segmentId, triggeredBy } = job.data;

    //  ბაზაში პოულობს სხვაობას (ვინ დაემატა, ვინ წავიდა) და ანახლებს წევრების სიას.
    const result = await this.deltaService.computeDelta(segmentId, triggeredBy);

    //  თუ ცვლილება მოხდა, შევამოწმოთ სხვა სეგმენტები (CASCADE)
    if (result) {
      const logType = getLogType(result.added.length, result.removed.length);
      // ვიღებთ სახელებს
      const addedIds = result.added.map((i: any) =>
        typeof i === 'string' ? i : i.id,
      );
      const removedIds = result.removed.map((i: any) =>
        typeof i === 'string' ? i : i.id,
      );

      const [segment, addedUsers, removedUsers] = await Promise.all([
        this.prisma.segment.findUnique({
          where: { id: segmentId },
          select: { name: true },
        }),
        this.prisma.customer.findMany({
          where: { id: { in: addedIds } },
          select: { id: true, name: true },
        }),
        this.prisma.customer.findMany({
          where: { id: { in: removedIds } },
          select: { id: true, name: true },
        }),
      ]);

      const addedNames = addedUsers.map((u) => u.name).join(', ');
      const removedNames = removedUsers.map((u) => u.name).join(', ');

      //  გლობალური ლოგი
      let logMsg = `სეგმენტი "${segment?.name}" განახლდა.`;
      if (addedUsers.length > 0) logMsg += ` დაემატა: ${addedNames};`;
      if (removedUsers.length > 0) logMsg += ` გავიდა: ${removedNames};`;

      this.gateway.server.emit('system:log', {
        id: Math.random(),
        message: logMsg,
        type: logType,
        time: new Date().toLocaleTimeString(),
      });

      // განახლება სპეციალური სეგმენტის დეტალებისთვის
      this.gateway.server
        .to(`segment:${segmentId}`)
        .emit('segment:update_event', {
          id: Math.random(),
          timestamp: new Date().toLocaleTimeString(),
          addedCount: result.added.length,
          removedCount: result.removed.length,
          addedSummary: addedNames,
          removedSummary: removedNames,
          triggeredBy: triggeredBy,
          newAddedMembers: addedUsers,
          removedIds: removedIds,
        });

      this.gateway.sendDeltaUpdate(segmentId, result);
      if (result.added.length > 0) {
        await this.campaignQueue.add('send-notification', {
          customerIds: addedIds,
          segmentId: segmentId,
        });
      }

      // თუ სეგმენტზე დამოკიდებულია კიდევ სხვა სეგმენტი ვპოულობთ მასაც და ვანახლებთ მასაც
      const dependentSegments = await this.prisma.segment.findMany({
        where: {
          rules: {
            // ვიღებთ conditions - ს
            path: ['conditions'],
            // ვიყენებთ array_contains ს რადგან ის იყენებს ინდექსაციას და პირდაპირ პოულობს ზუსტ ჩანაწერს
            array_contains: [{ type: 'IN_SEGMENT', segmentId: segmentId }],
          },
        },
      });

      for (const dep of dependentSegments) {
        await this.producer.triggerEvaluation(dep.id, `cascade:${segmentId}`);
      }
    }

    return result;
  }
}
