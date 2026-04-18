import { api } from "@/lib/api";

export const DeltaService = {
  async getAllDeltas() {
    return api.get("/deltas/all/deltas");
  },

  async getDeltas(id: string): Promise<any[]> {
    const res = await api.get(`/deltas/${id}/deltas`);
    return res.data || res;
  },
};
