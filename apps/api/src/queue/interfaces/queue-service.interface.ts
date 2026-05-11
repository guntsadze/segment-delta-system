export interface IQueueService {
  findDependentSegments(segmentId: string): Promise<any[]>;
}
