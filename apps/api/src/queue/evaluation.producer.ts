import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EvaluationProducer {
  constructor(@InjectQueue('segment-evaluation') private queue: Queue) {}

  async triggerEvaluation(segmentId: string, triggeredBy: string) {
    // jobId-ის გამოყენებით ვაკეთებთ დედუპლიკაციას (Debounce)
    await this.queue.add(
      'evaluate',
      { segmentId, triggeredBy },
      { 
        jobId: `eval-${segmentId}`, // ეს არის მთავარი!
        removeOnComplete: true 
      }
    );
  }
}