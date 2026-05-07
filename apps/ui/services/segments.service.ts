import { api } from "@/lib/api";
import { PaginationParams } from "@/types/pagination.types";

class SegmentsService {
  protected endpoint = "/segments";

  async getSegments(pagination: PaginationParams) {
    return api.get(`${this.endpoint}`, { params: pagination });
  }

  async getSegment(id: string) {
    return api.get(`${this.endpoint}/${id}`);
  }

  async createSegment(data: any) {
    return api.post(`${this.endpoint}`, data);
  }

  async updateSegment(id: string, data: any) {
    return api.patch(`${this.endpoint}/${id}`, data);
  }

  async deleteSegment(id: string) {
    return api.delete(`${this.endpoint}/${id}`);
  }

  async refreshSegment(id: string) {
    return api.post(`${this.endpoint}/${id}/refresh`, {});
  }
}

export default new SegmentsService();
