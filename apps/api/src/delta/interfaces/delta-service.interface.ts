import { PaginationDto } from 'src/common/dto/pagination.dto';

export interface IDeltaService {
  computeDelta(segmentId: string, triggeredBy: string): Promise<any>;
  getDeltas(id: string, pagination: PaginationDto): Promise<any>;
  getAllDeltas(pagination: PaginationDto): Promise<any>;
}
