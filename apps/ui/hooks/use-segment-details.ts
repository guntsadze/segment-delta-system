import { useState, useEffect, useCallback } from "react";
import { socket } from "@/lib/socket";
import deltaService from "@/services/delta.service";
import { useInfiniteScroll } from "./useInfiniteScroll";
import customersService from "@/services/customers.service";
import segmentsService from "@/services/segments.service";

export const useSegmentDetails = (id: string) => {
  const [segment, setSegment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const deltas = useInfiniteScroll<any>((page) =>
    deltaService.getDeltas(id, { page, limit: 10 }),
  );

  const members = useInfiniteScroll<any>((page) =>
    customersService.getMembersBySegment(id, { page, limit: 10 }),
  );

  const loadData = useCallback(async () => {
    try {
      const [seg] = await Promise.all([segmentsService.getSegment(id)]);
      setSegment(seg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleNewLog = (payload: any) => {
    console.log("🚀 ~ sync ~ payload:", payload);
    const { add, remove, total } = payload.updates;

    members.setData((prev) => [
      ...add,
      ...prev.filter((m) => !remove.includes(m.id)),
    ]);

    setSegment((prev: any) =>
      prev ? { ...prev, _count: { ...prev._count, members: total } } : prev,
    );

    deltas.setData((prev) => [payload, ...prev]);
  };

  useEffect(() => {
    loadData();
    socket.on("segment:delta", handleNewLog);
    socket.emit("join-segment", id);

    return () => {
      socket.emit("leave-segment", id);
      socket.off("segment:delta");
    };
  }, [id, loadData]);

  const refreshSegment = async () => {
    await segmentsService.refreshSegment(id);
    if (members.refresh) await members.refresh();
    if (deltas.refresh) await deltas.refresh();
  };

  return { deltas, segment, members, loading, refreshSegment };
};
