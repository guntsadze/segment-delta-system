"use client";
import { useForm } from "react-hook-form";
import {
  Play,
  PlusCircle,
  FastForward,
  UserSquare2,
  Terminal,
} from "lucide-react";
import { useSimulation } from "@/hooks/use-simulation";
import { LogViewer } from "@/components/simulation/LogViewer";
import { SegmentsService } from "@/services/segments.service";

export function SimulationContainer() {
  const {
    customers,
    logs,
    loading,
    executeTransaction,
    travelInTime,
    updateCustomer,
    bulkImport,
  } = useSimulation();

  const updateForm = useForm({
    defaultValues: { customerId: "", name: "" },
  });

  const transactionForm = useForm({
    defaultValues: { customerId: "", amount: 100 },
  });

  const timeForm = useForm({
    defaultValues: { target: "all", days: 30 },
  });

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Play className="text-blue-600" /> სიმულაციები
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <form
            onSubmit={updateForm.handleSubmit((d) =>
              updateCustomer(d.customerId, d.name),
            )}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
          >
            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800">
              <UserSquare2 size={18} className="text-purple-500" /> მონაცემების
              განახლება
            </h3>
            <div className="space-y-4">
              <select
                {...updateForm.register("customerId")}
                className="w-full p-2 border rounded-lg bg-slate-50 outline-none"
              >
                <option value="">აირჩიე მომხმარებელი</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="ახალი სახელი"
                {...updateForm.register("name")}
                className="w-full p-2 border rounded-lg bg-slate-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition"
              >
                განახლება
              </button>
            </div>
          </form>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-red-500">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-slate-800">
              <Terminal size={18} className="text-red-500" /> Bulk Stress Test
            </h3>
            <p className="text-[10px] text-slate-500 mb-4 uppercase font-bold tracking-wider">
              სისტემის დატვირთვა პორციებად (Chunking)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => bulkImport(100)}
                disabled={loading}
                className="bg-slate-100 py-2 rounded-lg text-xs font-bold hover:bg-slate-200"
              >
                100 იუზერი
              </button>
              <button
                onClick={() => bulkImport(1000)}
                disabled={loading}
                className="bg-slate-100 py-2 rounded-lg text-xs font-bold hover:bg-slate-200"
              >
                1K იუზერი
              </button>
              <button
                onClick={() => bulkImport(10000)}
                disabled={loading}
                className="bg-red-50 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-100 border border-red-100"
              >
                10K (Stress)
              </button>
            </div>
          </div>
          {/* Transaction Card */}
          <form
            onSubmit={transactionForm.handleSubmit((d) =>
              executeTransaction(d.customerId, d.amount),
            )}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
          >
            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800">
              <PlusCircle size={18} className="text-green-500" /> დაამატე
              ტრანზაქცია
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
                {loading ? "ტრანზაქციის შექმნა..." : "ტრანზაქციის შექმნა"}
              </button>
            </div>
          </form>

          {/* Time Travel Card */}
          <form
            onSubmit={timeForm.handleSubmit((d) =>
              travelInTime(d.days, d.target),
            )}
            className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm"
          >
            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800">
              <FastForward size={18} className="text-orange-500" /> დღეების
              დამატება
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
                  className="flex-1 w-24 p-2 border rounded-lg bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition"
                >
                  დამატება
                </button>
              </div>
            </div>
          </form>
        </div>

        <LogViewer logs={logs} />
      </div>
    </div>
  );
}
