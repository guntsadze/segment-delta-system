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

  const handleNewLog = (newLog: any) => {
    deltas.setData((prev) => [newLog, ...prev]);
  };

  useEffect(() => {
    loadData();
    socket.on("segment:delta", handleNewLog);
    socket.emit("join-segment", id);
    socket.on("segment:update_event", loadData);

    return () => {
      socket.emit("leave-segment", id);
      socket.off("segment:delta");
    };
  }, [id, loadData]);

  const refreshSegment = async () => {
    setLoading(true);
    await segmentsService.refreshSegment(id);
    await loadData();
  };

  return { deltas, segment, members, loading, refreshSegment };
};
