export interface ISimulationRepository {
  createTransaction(customerId: string, amount: number): Promise<any>;
  createManyTransactions(
    data: { customerId: string; amount: number }[],
  ): Promise<any>;
  updateCustomerTotalSpent(
    customerId: string,
    totalIncrement: number,
  ): Promise<void>;
  getCustomerById(customerId: string): Promise<any>;
  advanceTimeRaw(days: number, customerId?: string): Promise<void>;
  findDynamicSegmentIds(): Promise<{ id: string }[]>;
  updateCustomerData(customerId: string, data: any): Promise<any>;
  bulkCreateCustomers(data: any[]): Promise<void>;
  upsertMembership(segmentId: string, customerId: string): Promise<any>;
  createManualDelta(segmentId: string, customerId: string): Promise<void>;
  getSegmentAndCustomerNames(
    segmentId: string,
    customerId: string,
  ): Promise<[any, any]>;
}
