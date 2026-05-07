import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'types/pagination.types';

export interface IDeltaRepository {
  getMembers(
    segmentId: string,
    // pagination: PaginationDto,
  ): Promise<any[]>;
  getCustomersByIds(
    ids: string[],
  ): Promise<{ id: string; email: string; name: string }[]>;

  updateSegment(params: {
    segmentId: string;
    added: string[];
    removed: string[];
    triggeredBy: string;
  }): Promise<any>;

  getDeltasBySegment(
    segmentId: string,
    pagination: PaginationDto,
  ): Promise<any[] | PaginatedResult<any>>;
  getAllDeltas(
    pagination: PaginationDto,
  ): Promise<any[] | PaginatedResult<any>>;
}

export interface IEvaluator {
  evaluate(segmentId: string): Promise<Set<string>>;
}
