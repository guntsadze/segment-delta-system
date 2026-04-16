import { useState, useEffect, useCallback } from "react";
import { SegmentsService } from "@/services/segments.service";
import { socket } from "@/lib/socket";
import { SegmentFormValues } from "@/types/segment";

export const useSegments = () => {
  const [segments, setSegments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // მონაცემების ჩატვირთვა
  const fetchSegments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await SegmentsService.getAll();
      setSegments(data as any);
    } catch (err) {
      setError("ვერ მოხერხდა სეგმენტების ჩატვირთვა");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSegments();

    // Socket ლოგიკა
    socket.on("segment:counts_update", ({ segmentId, delta }) => {
      setSegments((prev) =>
        prev.map((s) =>
          s.id === segmentId
            ? {
                ...s,
                memberCount:
                  s.memberCount + (delta.added.length - delta.removed.length),
                pulse: true,
              }
            : s,
        ),
      );

      // Pulse ეფექტის მოცილება
      setTimeout(() => {
        setSegments((prev) => prev.map((s) => ({ ...s, pulse: false })));
      }, 2500);
    });

    return () => {
      socket.off("segment:counts_update");
    };
  }, [fetchSegments]);

  // მოქმედებები
  const addSegment = async (data: SegmentFormValues) => {
    const res = await SegmentsService.create(data);
    setSegments((prev) => [res, ...prev]);
    return res;
  };

  const updateSegment = async (id: string, data: SegmentFormValues) => {
    const res = await SegmentsService.update(id, data);
    setSegments((prev) =>
      prev.map((s) =>
        s.id === id ? { ...res, memberCount: s.memberCount } : s,
      ),
    );
    return res;
  };

  const removeSegment = async (id: string) => {
    await SegmentsService.delete(id);
    setSegments((prev) => prev.filter((s) => s.id !== id));
  };

  return {
    segments,
    isLoading,
    error,
    addSegment,
    updateSegment,
    removeSegment,
    refresh: fetchSegments,
  };
};
