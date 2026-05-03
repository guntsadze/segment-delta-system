import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { DeltaService } from '../../delta/delta.service';
import { EvaluationProducer } from '../providers/evaluation.producer';
import { getLogType } from 'src/common/utils/log-helper';
import { Inject } from '@nestjs/common';
import type { ISegmentService } from '../interfaces/segment-service.interface';
import type { INotificationGateway } from '../interfaces/notification-gateway.interface';

// ვიღებთ დავცალებას რიგიდან
@Processor('segment-evaluation')
export class EvaluationProcessor extends WorkerHost {
  constructor(
    private deltaService: DeltaService,
    private producer: EvaluationProducer,
    @Inject('ISegmentService') private segmentService: ISegmentService,
    @Inject('INotificationGateway') private gateway: INotificationGateway,
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
        this.segmentService.getSegmentById(segmentId),
        this.segmentService.getCustomerNames(addedIds),
        this.segmentService.getCustomerNames(removedIds),
      ]);

      const addedNames = addedUsers.map((u) => u.name).join(', ');
      const removedNames = removedUsers.map((u) => u.name).join(', ');

      //  გლობალური ლოგი
      let logMsg = `სეგმენტი "${segment?.name}" განახლდა.`;
      if (addedUsers.length > 0) logMsg += ` დაემატა: ${addedNames};`;
      if (removedUsers.length > 0) logMsg += ` გავიდა: ${removedNames};`;

      this.gateway.sendSystemLog({
        id: Math.random(),
        message: logMsg,
        type: logType,
        time: new Date().toLocaleTimeString(),
      });

      // განახლება სპეციალური სეგმენტის დეტალებისთვის
      this.gateway.sendSegmentUpdate(segmentId, {
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
      const dependentSegments =
        await this.segmentService.findDependentSegments(segmentId);

      for (const dep of dependentSegments) {
        await this.producer.triggerEvaluation(dep.id, `cascade:${segmentId}`);
      }
    }

    return result;
  }
}
