export interface ISimulationService {
  addTransaction(
    customerId: string,
    amount: number,
    count?: number,
  ): Promise<any>;
  advanceTime(days: number, customerId?: string): Promise<{ message: string }>;
  updateCustomer(customerId: string, data: any): Promise<any>;
  bulkImport(count: number): Promise<{ message: string }>;
  addMemberManually(segmentId: string, customerId: string): Promise<any>;
}
