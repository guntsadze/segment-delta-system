import { api } from "@/lib/api";
import { PaginationParams } from "@/types/pagination.types";

class CustomersService {
  protected endpoint = "/customers";

  async getCustomers(pagination: PaginationParams) {
    return api.get(`${this.endpoint}`, { params: pagination });
  }

  async getMembersBySegment(id: string, pagination: PaginationParams) {
    return api.get(`${this.endpoint}/${id}/members`, { params: pagination });
  }
}

export default new CustomersService();
