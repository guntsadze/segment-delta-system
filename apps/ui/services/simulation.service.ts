import { api } from "@/lib/api";

export const SimulationService = {
  // მომხმარებლების წამოღება სიმულაციისთვის
  async getCustomers() {
    return api.get<any[]>("/segments/all/customers");
  },

  // ტრანზაქციის დამატება
  async addTransaction(customerId: string, amount: number, count: number) {
    return api.post("/simulation/transaction", { customerId, amount, count });
  },

  // დროის გადაწევა
  async advanceTime(days: number, customerId?: string) {
    return api.post("/simulation/advance-time", {
      days,
      customerId: customerId === "all" ? undefined : customerId,
    });
  },

  async updateCustomer(customerId: string, data: any) {
    return api.post("/simulation/update-customer", { customerId, data });
  },

  async bulkImport(count: number) {
    return api.post("/simulation/bulk-import", { count });
  },

  async addToStaticSegment(segmentId: string, customerId: string) {
    return api.post(`/segments/${segmentId}/add-member`, { customerId });
  },
};
