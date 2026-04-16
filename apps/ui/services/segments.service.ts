import { api } from "@/lib/api";
import { SegmentFormValues } from "@/types/segment";

export const SegmentsService = {
  async getAll() {
    const res = await api.get("/segments");
    return res;
  },

  async getById(id: string) {
    return api.get(`/segments/${id}`);
  },

  async create(data: SegmentFormValues) {
    return api.post("/segments", data);
  },

  async update(id: string, data: SegmentFormValues) {
    return api.patch(`/segments/${id}`, data);
  },

  async delete(id: string) {
    return api.delete(`/segments/${id}`);
  },

  async getDeltas(id: string) {
    return api.get(`/segments/${id}/deltas`);
  },

  async refresh(id: string) {
    return api.post(`/segments/${id}/refresh`, {});
  },

  async getMembers(id: string): Promise<any[]> {
    const res = await api.get(`/segments/${id}/members`);
    return res.data;
  },
};
