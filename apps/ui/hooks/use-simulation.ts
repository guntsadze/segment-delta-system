import { useState, useEffect } from "react";
import { SimulationService } from "@/services/simulation.service";
import { socket } from "@/lib/socket";
import { SegmentsService } from "@/services/segments.service";
import deltaService from "@/services/delta.service";
import { useInfiniteScroll } from "./useInfiniteScroll";
import customersService from "@/services/customers.service";

export const useSimulation = () => {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const logs = useInfiniteScroll<any>(
    (page) => deltaService.getAllDeltas({ page, limit: 10 }),
    [],
  );

  const customers = useInfiniteScroll<any>(
    (page) => customersService.getCustomers({ page, limit: 10 }),
    [],
  );

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [segRes] = await Promise.all([SegmentsService.getAll()]);

        setSegments(segRes.data || segRes);
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    };

    loadInitialData();

    const handleNewLog = (newLog: any) => {
      logs.setData((prev) => [newLog, ...prev]);
    };

    socket.on("system:log", handleNewLog);

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
      // await SimulationService.getCustomers();
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
