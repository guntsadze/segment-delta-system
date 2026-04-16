import { useState, useEffect, useCallback } from "react";
import { SegmentsService } from "@/services/segments.service";
import { socket } from "@/lib/socket";

export const useSegmentDetails = (id: string) => {
  const [segment, setSegment] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadData();
    socket.emit("join-segment", id);

    socket.on("segment:delta", (data) => {
      // ახალი ივენთის დამატება ფიდში
      setFeed((prev) =>
        [
          {
            id: Math.random(),
            timestamp: new Date().toLocaleTimeString(),
            ...data,
          },
          ...prev,
        ].slice(0, 20),
      );

      // წევრების სიის განახლება
      SegmentsService.getMembers(id).then(setMembers);
    });

    return () => {
      socket.emit("leave-segment", id);
      socket.off("segment:delta");
    };
  }, [id, loadData]);

  const refreshSegment = () => SegmentsService.refresh(id);

  return { segment, members, feed, loading, refreshSegment };
};
