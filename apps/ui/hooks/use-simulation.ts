import { useState, useEffect, useCallback } from "react";
import { SimulationService } from "@/services/simulation.service";
import { socket } from "@/lib/socket";

export const useSimulation = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    SimulationService.getCustomers().then(setCustomers);

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

  return { customers, logs, loading, executeTransaction, travelInTime };
};
