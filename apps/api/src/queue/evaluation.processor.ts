import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DeltaService } from '../delta/delta.service';
import { EvaluationProducer } from './evaluation.producer';
import { DeltaGateway } from 'src/gateway/delta.gateway';
import { PrismaService } from 'prisma/prisma.service';

// ვიღებთ დავცალებას რიგიდან
@Processor('segment-evaluation')
export class EvaluationProcessor extends WorkerHost {
  constructor(
    private deltaService: DeltaService,
    private producer: EvaluationProducer,
    private gateway: DeltaGateway,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{ segmentId: string; triggeredBy: string }>) {
    const { segmentId, triggeredBy } = job.data;

    // 1. ბაზაში პოულობს სხვაობას (ვინ დაემატა, ვინ წავიდა) და ანახლებს წევრების სიას.
    const result = await this.deltaService.computeDelta(segmentId, triggeredBy);

    // 2. თუ ცვლილება მოხდა, შევამოწმოთ სხვა სეგმენტები (CASCADE)
    if (result) {
      this.gateway.sendDeltaUpdate(segmentId, result);
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

      // აქ მოგვიანებით დავამატებთ Socket.IO ემიტს
      // console.log(
      //   `✅ Processed ${segmentId}. Cascade triggered for ${dependentSegments.length} segments.`,
      // );
    }

    return result;
  }
}
