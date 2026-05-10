import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'types/pagination.types';

export interface ICustomerRepository {
  getMembersBySegment(
    segmentId: string,
    pagination?: PaginationDto,
  ): Promise<any[] | PaginatedResult<any>>;
  getMemberIds(segmentId: string): Promise<string[]>;
}
