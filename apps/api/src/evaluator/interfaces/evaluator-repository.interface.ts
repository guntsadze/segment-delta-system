import { Segment } from '../evaluator.types';

export interface IEvaluatorRepository {
  getSegmentById(id: string): Promise<Segment | null>;
  getStaticMembers(segmentId: string): Promise<string[]>;
  getCustomersByMinTransactions(
    days: number,
    minCount: number,
  ): Promise<string[]>;
  getCustomersByMinSpend(days: number, minAmount: number): Promise<string[]>;
  getInactiveCustomers(inactiveDays: number): Promise<string[]>;
  getSegmentMembers(segmentId: string): Promise<string[]>;
}
