import { useState, useEffect, useCallback } from "react";
import { SimulationService } from "@/services/simulation.service";
import { socket } from "@/lib/socket";
import { SegmentsService } from "@/services/segments.service";

export const useSimulation = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const updateCustomer = async (customerId: string, name: string) => {
    setLoading(true);
    try {
      await SimulationService.updateCustomer(customerId, { name });
      addLog(`Success: Customer name updated to "${name}".`);
    } finally {
      setLoading(false);
    }
  };

  const bulkImport = async (count: number) => {
    setLoading(true);
    try {
      addLog(`Starting Bulk Import of ${count} users...`, "action");
      await SimulationService.bulkImport(count);
      addLog(`Success: ${count} users imported and queued.`);
    } finally {
      setLoading(false);
    }
  };

  const addLog = useCallback((message: string, type = "action") => {
    setLogs((prev) => [
      {
        id: Math.random(),
        time: new Date().toLocaleTimeString(),
        message,
        type,
      },
      ...prev,
    ]);
  }, []);

  useEffect(() => {
    SimulationService.getCustomers().then(
      setCustomers as unknown as () => void,
    );

    SegmentsService.getAll().then((res) => {
      setSegments(res.data || res);
    });

    socket.on("segment:counts_update", ({ segmentId, delta }) => {
      addLog(
        `Segment ${segmentId} updated: +${delta.added.length}, -${delta.removed.length}`,
        "update",
      );
    });

    return () => {
      socket.off("segment:counts_update");
    };
  }, [addLog]);

  const executeTransaction = async (customerId: string, amount: number) => {
    setLoading(true);
    try {
      await SimulationService.addTransaction(customerId, amount);
      addLog(`Success: $${amount} charged to customer.`);
    } finally {
      setLoading(false);
    }
  };

  const travelInTime = async (days: number, customerId?: string) => {
    setLoading(true);
    try {
      await SimulationService.advanceTime(days, customerId);
      addLog(`Time Travel: Advanced ${days} days.`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = async (data: {
    segmentId: string;
    customerId: string;
  }) => {
    setLoading(true);
    try {
      await SimulationService.addToStaticSegment(
        data.segmentId,
        data.customerId,
      );
      alert("მომხმარებელი წარმატებით დაემატა სეგმენტს!");
    } finally {
      setLoading(false);
    }
  };

  return {
    customers,
    segments,
    logs,
    loading,
    executeTransaction,
    travelInTime,
    updateCustomer,
    bulkImport,
    handleManualAdd,
  };
};
