import { api } from "@/lib/api";

export const SimulationService = {
  // მომხმარებლების წამოღება სიმულაციისთვის
  async getCustomers() {
    return api.get<any[]>("/segments/all/customers");
  },

  // ტრანზაქციის დამატება
  async addTransaction(customerId: string, amount: number) {
    return api.post("/simulation/transaction", { customerId, amount });
  },

  // დროის გადაწევა
  async advanceTime(days: number, customerId?: string) {
    return api.post("/simulation/advance-time", {
      days,
      customerId: customerId === "all" ? undefined : customerId,
    });
  },
};
