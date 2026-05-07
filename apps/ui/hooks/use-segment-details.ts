import { useState, useEffect, useCallback } from "react";
import { SegmentsService } from "@/services/segments.service";
import { socket } from "@/lib/socket";
import deltaService from "@/services/delta.service";
import { useInfiniteScroll } from "./useInfiniteScroll";

export const useSegmentDetails = (id: string) => {
  const [segment, setSegment] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const deltas = useInfiniteScroll<any>((page) =>
    deltaService.getDeltas(id, { page, limit: 10 }),
  );

  const loadData = useCallback(async () => {
    try {
      const [seg, mems] = await Promise.all([
        SegmentsService.getById(id),
        SegmentsService.getMembers(id),
      ]);
      setSegment(seg);
      setMembers(mems);
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
    await SegmentsService.refresh(id);
    await loadData();
  };

  return { deltas, segment, members, loading, refreshSegment };
};
