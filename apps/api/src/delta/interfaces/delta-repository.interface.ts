import {
  Customer,
  DeltaAddition,
  DeltaRemoval,
  Segment,
  SegmentDelta,
} from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResult } from 'types/pagination.types';

export interface IDeltaRepository {
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

export type DeltaWithRelations = SegmentDelta & {
  segment: Segment;
  additions: (DeltaAddition & { customer: Customer })[];
  removals: (DeltaRemoval & { customer: Customer })[];
};

export type DeltaItemWithCustomer = (DeltaAddition | DeltaRemoval) & {
  customer: Customer;
};
