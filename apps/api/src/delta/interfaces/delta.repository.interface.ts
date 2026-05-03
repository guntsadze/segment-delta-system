export interface IDeltaRepository {
  getMembers(segmentId: string): Promise<string[]>;
  getCustomersByIds(
    ids: string[],
  ): Promise<{ id: string; email: string; name: string }[]>;

  updateSegment(params: {
    segmentId: string;
    added: string[];
    removed: string[];
    triggeredBy: string;
  }): Promise<any>;

  getDeltasBySegment(segmentId: string, limit: number): Promise<any[]>;
  getAllDeltas(limit: number): Promise<any[]>;
}

export interface IEvaluator {
  evaluate(segmentId: string): Promise<Set<string>>;
}
