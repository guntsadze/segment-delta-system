export interface IEvaluationProducer {
  triggerEvaluation(segmentId: string, triggeredBy: string): Promise<void>;
}
