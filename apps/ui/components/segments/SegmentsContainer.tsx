"use client";

import { useState } from "react";
import { Plus, Loader2, LayoutGrid } from "lucide-react";
import { SegmentCard } from "@/components/segments/SegmentCard";
import { SegmentForm } from "@/components/segments/forms/SegmentForm";
import { useSegments } from "@/hooks/use-segments";
import { SegmentFormValues } from "@/types/segment";
import { Modal } from "../ui/Modal";

export function SegmentsContainer() {
  const { segments, isLoading, addSegment, updateSegment, removeSegment } =
    useSegments();

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [editingSegment, setEditingSegment] = useState<any | null>(null);

  const closeForm = () => {
    setActiveModal(null);
    setEditingSegment(null);
  };

  const handleSave = async (data: SegmentFormValues) => {
    try {
      if (editingSegment) {
        await updateSegment(editingSegment.id, data);
      } else {
        await addSegment(data);
      }
      closeForm();
    } catch (err) {
      console.error("Save error:", err);
      alert("შეცდომა შენახვისას!");
    }
  };

  if (isLoading)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      {/* --- HEADER --- */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <LayoutGrid className="text-blue-600" /> სეგმენტები
          </h1>
        </div>

        <button
          onClick={() => setActiveModal("segment")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-100 font-bold active:scale-95"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* --- SEGMENT MODAL --- */}
      <Modal
        isOpen={activeModal === "segment"}
        onClose={closeForm}
        title={editingSegment ? "სეგმენტის რედაქტირება" : "სეგმენტის დამატება"}
      >
        <div className="max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          <SegmentForm
            initialData={editingSegment}
            onSubmit={handleSave}
            onClose={closeForm}
            availableSegments={segments}
          />
        </div>
      </Modal>

      {/* --- GRID --- */}
      {segments?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segments.map((s) => (
            <SegmentCard
              key={s.id}
              segment={s}
              onEdit={(e, seg) => {
                e.preventDefault();
                setEditingSegment(seg);
                setActiveModal("segment");
              }}
              onDelete={(e, id) => {
                e.preventDefault();
                if (confirm("ნამდვილად გსურთ წაშლა?")) removeSegment(id);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-medium">სეგმენტები ვერ მოიძებნა</p>
        </div>
      )}
    </div>
  );
}
