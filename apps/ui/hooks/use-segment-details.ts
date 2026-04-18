import { useState, useEffect, useCallback } from "react";
import { SegmentsService } from "@/services/segments.service";
import { socket } from "@/lib/socket";
import { DeltaService } from "@/services/delta.service";

export const useSegmentDetails = (id: string) => {
  const [segment, setSegment] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [seg, mems, history] = await Promise.all([
        SegmentsService.getById(id),
        SegmentsService.getMembers(id),
        DeltaService.getDeltas(id),
      ]);
      setSegment(seg);
      setMembers(mems);
      setFeed(history);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
    socket.emit("join-segment", id);
    socket.on("segment:update_event", loadData);

    return () => {
      socket.emit("leave-segment", id);
      socket.off("segment:delta");
    };
  }, [id, loadData]);

  const refreshSegment = () => SegmentsService.refresh(id);

  return { segment, members, feed, loading, refreshSegment };
};
