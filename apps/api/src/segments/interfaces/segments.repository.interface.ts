import { PaginationDto } from 'src/common/dto/pagination.dto';

export interface ISegmentsRepository {
  findAllSegments(pagination: PaginationDto): Promise<any>;
  findSegmentById(id: string): Promise<any>;
  createSegment(data: any): Promise<any>;
  updateSegment(id: string, data: any): Promise<any>;
  deleteSegmentWithRelations(id: string): Promise<any>;
  validateRules(targetSegmentId: string, rules: any): Promise<void>;
  findDependentSegments(id: string): Promise<any[]>;
}
