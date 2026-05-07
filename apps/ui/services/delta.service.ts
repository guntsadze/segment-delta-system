import { api } from "@/lib/api";
import { PaginationParams } from "@/types/pagination.types";

class DeltaService {
  protected endpoint = "/deltas";

  async getAllDeltas(params: PaginationParams) {
    return api.get(`${this.endpoint}/all/deltas`, { params });
  }

  async getDeltas(id: string, params: PaginationParams) {
    return api.get(`${this.endpoint}/${id}/deltas`, { params });
  }
}

export default new DeltaService();
