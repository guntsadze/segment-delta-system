import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { DeltaService } from '../../delta/delta.service';
import { EvaluationProducer } from '../providers/evaluation.producer';
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

    if (result) {
      this.gateway.sendSystemLog({
        message: result.message,
        type: result.type,
        time: result.time,
      });

      this.gateway.sendDeltaUpdate(segmentId, result);

      if (result.updates.add.length > 0) {
        await this.campaignQueue.add('send-notification', {
          customerIds: result.updates.add.map((u) => u.id),
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
