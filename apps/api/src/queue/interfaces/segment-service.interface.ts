export interface ISegmentService {
  getSegmentById(id: string): Promise<any>;
  findDependentSegments(segmentId: string): Promise<any[]>;
  getCustomerNames(ids: string[]): Promise<any[]>;
  getCustomerById(id: string): Promise<any>;
}
