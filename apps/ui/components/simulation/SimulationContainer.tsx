"use client";
import { useState } from "react";
import { Play, Terminal, UserPlus } from "lucide-react";
import { useSimulation } from "@/hooks/use-simulation";
import { LogViewer } from "@/components/simulation/LogViewer";
import { Modal } from "@/components/ui/Modal";
import { UpdateProfileForm } from "./forms/UpdateProfileForm";
import { TransactionForm } from "./forms/TransactionForm";
import { ManualAddForm } from "./forms/ManualAddForm";
import { TimeTravelForm } from "./forms/TimeTravelForm";
import { StressTestActions } from "./forms/StressTestActions";
import { SimulationSidebar } from "./SimulationSidebar";

export function SimulationContainer() {
  const {
    customers,
    segments,
    logs,
    loading,
    executeTransaction,
    travelInTime,
    updateCustomer,
    bulkImport,
    handleManualAdd,
  } = useSimulation();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const close = () => setActiveModal(null);

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <Play className="fill-blue-600 text-blue-600" size={32} />{" "}
            სიმულაციები
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveModal("stress")}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 hover:bg-red-100 transition font-bold text-xs"
          >
            <Terminal size={14} /> სტრეს ტესტი
          </button>
          <button
            onClick={() => setActiveModal("manual")}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl hover:bg-black transition font-bold text-sm shadow-lg shadow-slate-200"
          >
            <UserPlus size={16} /> სტატიკურში ჩამატება
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- LEFT SIDEBAR: ACTIONS --- */}
        <SimulationSidebar onAction={(type) => setActiveModal(type)} />

        {/* --- MAIN CONTENT: LOGS --- */}
        <div className="lg:col-span-8">
          <LogViewer logs={logs} />
        </div>
      </div>

      {/* --- MODALS SECTION (Portals) --- */}

      {/* 1. Manual Add Modal */}
      <Modal
        isOpen={activeModal === "manual"}
        onClose={close}
        title="სეგმენტში ჩამატება"
      >
        <ManualAddForm
          segments={segments}
          customers={customers}
          loading={loading}
          onSubmit={(d) => {
            handleManualAdd(d);
            close();
          }}
        />
      </Modal>

      {/* 2. Transaction Modal */}
      <Modal
        isOpen={activeModal === "transaction"}
        onClose={close}
        title="ახალი ტრანზაქცია"
      >
        <TransactionForm
          customers={customers}
          loading={loading}
          onSubmit={(id, amt) => {
            executeTransaction(id, amt);
            close();
          }}
        />
      </Modal>

      {/* 3. Update Profile Modal */}
      <Modal
        isOpen={activeModal === "update"}
        onClose={close}
        title="პროფილის რედაქტირება"
      >
        <UpdateProfileForm
          customers={customers}
          loading={loading}
          onSubmit={(id, name) => {
            updateCustomer(id, name);
            close();
          }}
        />
      </Modal>

      {/* --- Time Travel Modal --- */}
      <Modal
        isOpen={activeModal === "time"}
        onClose={close}
        title="დროის სიმულაცია"
      >
        <TimeTravelForm
          customers={customers}
          loading={loading}
          onSubmit={(days, target) => {
            travelInTime(days, target);
            close();
          }}
        />
      </Modal>

      {/* --- Stress Test Modal --- */}
      <Modal
        isOpen={activeModal === "stress"}
        onClose={close}
        title="სისტემის დატვირთვა"
      >
        <StressTestActions
          loading={loading}
          onImport={(amt) => {
            bulkImport(amt);
            close();
          }}
        />
      </Modal>
    </div>
  );
}
