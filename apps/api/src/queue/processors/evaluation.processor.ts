import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Inject } from '@nestjs/common';
import type { INotificationGateway } from '../interfaces/notification-gateway.interface';
import type { IQueueService } from '../interfaces/queue-service.interface';
import { IEvaluationProcessor } from '../interfaces/evaluation-processor.interface';
import type { IEvaluationProducer } from '../interfaces/evaluation-producer.interface';
import type { IDeltaService } from 'src/delta/interfaces/delta-service.interface';

// ვიღებთ დავცალებას რიგიდან
@Processor('segment-evaluation', {
  concurrency: 50,
})
export class EvaluationProcessor
  extends WorkerHost
  implements IEvaluationProcessor
{
  constructor(
    @Inject('IDeltaService') private readonly deltaService: IDeltaService,
    @Inject('IEvaluationProducer') private producer: IEvaluationProducer,
    @Inject('IQueueService') private queueService: IQueueService,
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
        await this.queueService.findDependentSegments(segmentId);

      for (const dep of dependentSegments) {
        await this.producer.triggerEvaluation(dep.id, `cascade:${segmentId}`);
      }
    }

    return result;
  }
}
