import { useState, useEffect } from "react";
import segmentsService from "@/services/segments.service";
import { socket } from "@/lib/socket";
import { SegmentFormValues } from "@/types/segment";
import { useInfiniteScroll } from "./useInfiniteScroll";

export const useSegments = () => {
  const [error, setError] = useState<string | null>(null);

  const segments = useInfiniteScroll<any>((page) =>
    segmentsService.getSegments({ page, limit: 10 }),
  );

  useEffect(() => {
    const handleCountUpdate = ({
      segmentId,
      delta,
    }: {
      segmentId: string;
      delta: any;
    }) => {
      segments.setData((prev) =>
        prev.map((s) => {
          if (s.id !== segmentId) return s;

          const currentCount = Number(s.memberCount ?? s._count?.members ?? 0);

          const added = Array.isArray(delta.added) ? delta.added.length : 0;
          const removed = Array.isArray(delta.removed)
            ? delta.removed.length
            : 0;

          return {
            ...s,
            memberCount: currentCount + (added - removed),
            pulse: true,
          };
        }),
      );

      // Pulse ეფექტის მოცილება
      setTimeout(() => {
        segments.setData((prev) =>
          prev.map((s) => (s.id === segmentId ? { ...s, pulse: false } : s)),
        );
      }, 2500);
    };

    socket.on("segment:counts_update", handleCountUpdate);
    return () => {
      socket.off("segment:counts_update", handleCountUpdate);
    };
  }, [segments.setData]);

  // CRUD მოქმედებები
  const addSegment = async (data: SegmentFormValues) => {
    try {
      const res = await segmentsService.createSegment(data);
      const newSegment = res.data || res;

      segments.setData((prev) => [newSegment, ...prev]);
      return newSegment;
    } catch (err) {
      setError("ვერ მოხერხდა სეგმენტის დამატება");
      throw err;
    }
  };

  const updateSegment = async (id: string, data: SegmentFormValues) => {
    try {
      const res = await segmentsService.updateSegment(id, data);
      const updatedData = res.data || res;

      segments.setData((prev) =>
        prev.map((s) =>
          s.id === id ? { ...updatedData, memberCount: s.memberCount } : s,
        ),
      );
      return updatedData;
    } catch (err) {
      setError("ვერ მოხერხდა სეგმენტის განახლება");
      throw err;
    }
  };

  const removeSegment = async (id: string) => {
    try {
      await segmentsService.deleteSegment(id);
      segments.setData((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError("ვერ მოხერხდა სეგმენტის წაშლა");
      throw err;
    }
  };

  return {
    segments,
    error,
    addSegment,
    updateSegment,
    removeSegment,
  };
};
