import { Job } from 'bullmq';

export interface IEvaluationProcessor {
  process(job: Job<{ segmentId: string; triggeredBy: string }>): Promise<any>;
}
