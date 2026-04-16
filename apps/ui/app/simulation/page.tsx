"use client";
import { useForm } from "react-hook-form";
import { Play, PlusCircle, FastForward } from "lucide-react";
import { useSimulation } from "@/hooks/use-simulation";
import { LogViewer } from "@/components/simulation/LogViewer";

export default function SimulationPage() {
  const { customers, logs, loading, executeTransaction, travelInTime } =
    useSimulation();

  // ფორმა 1: ტრანზაქცია
  const transactionForm = useForm({
    defaultValues: { customerId: "", amount: 100 },
  });

  // ფორმა 2: დროის მოგზაურობა
  const timeForm = useForm({
    defaultValues: { target: "all", days: 30 },
  });

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Play className="text-blue-600" /> System Simulation
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Transaction Card */}
          <form
            onSubmit={transactionForm.handleSubmit((d) =>
              executeTransaction(d.customerId, d.amount),
            )}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
          >
            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800">
              <PlusCircle size={18} className="text-green-500" /> Add
              Transaction
            </h3>
            <div className="space-y-4">
              <select
                {...transactionForm.register("customerId")}
                className="w-full p-2 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                {...transactionForm.register("amount", { valueAsNumber: true })}
                className="w-full p-2 border rounded-lg bg-slate-50"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? "Processing..." : "Execute Transaction"}
              </button>
            </div>
          </form>

          {/* Time Travel Card */}
          <form
            onSubmit={timeForm.handleSubmit((d) =>
              travelInTime(d.days, d.target),
            )}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
          >
            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800">
              <FastForward size={18} className="text-orange-500" /> Advance Time
            </h3>
            <div className="space-y-4">
              <select
                {...timeForm.register("target")}
                className="w-full p-2 border rounded-lg bg-slate-50"
              >
                <option value="all">🌍 Global (Everyone)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    👤 {c.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-4">
                <input
                  type="number"
                  {...timeForm.register("days", { valueAsNumber: true })}
                  className="flex-1 p-2 border rounded-lg bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition"
                >
                  Travel
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ლოგების კომპონენტი (უცვლელი) */}
        <LogViewer logs={logs} />
      </div>
    </div>
  );
}
