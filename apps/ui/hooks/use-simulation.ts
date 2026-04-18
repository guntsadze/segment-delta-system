import { useState, useEffect } from "react";
import { SimulationService } from "@/services/simulation.service";
import { socket } from "@/lib/socket";
import { SegmentsService } from "@/services/segments.service";
import { DeltaService } from "@/services/delta.service";

export const useSimulation = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [custRes, segRes, deltaRes] = await Promise.all([
          SimulationService.getCustomers(),
          SegmentsService.getAll(),
          DeltaService.getAllDeltas(),
        ]);

        setCustomers(custRes.data || custRes);
        setSegments(segRes.data || segRes);
        setLogs(deltaRes as any);
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    };

    loadInitialData();

    socket.on("system:log", (newLog) => {
      setLogs((prev) => [newLog, ...prev].slice(0, 50));
    });

    return () => {
      socket.off("system:log");
    };
  }, []);

  const updateCustomer = async (customerId: string, name: string) => {
    setLoading(true);
    try {
      await SimulationService.updateCustomer(customerId, { name });
    } finally {
      setLoading(false);
    }
  };

  const bulkImport = async (count: number) => {
    setLoading(true);
    try {
      await SimulationService.bulkImport(count);
      await SimulationService.getCustomers();
    } finally {
      setLoading(false);
    }
  };

  const executeTransaction = async (
    customerId: string,
    amount: number,
    count: number,
  ) => {
    setLoading(true);
    try {
      await SimulationService.addTransaction(customerId, amount, count);
    } finally {
      setLoading(false);
    }
  };

  const travelInTime = async (days: number, customerId?: string) => {
    setLoading(true);
    try {
      await SimulationService.advanceTime(days, customerId);
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
