"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { SegmentCard } from "@/components/segments/SegmentCard";
import { SegmentForm } from "@/components/segments/SegmentForm";
import { useSegments } from "@/hooks/use-segments";
import { SegmentFormValues } from "@/types/segment";

export function SegmentsContainer() {
  const { segments, isLoading, addSegment, updateSegment, removeSegment } =
    useSegments();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<any | null>(null);

  const handleSave = async (data: SegmentFormValues) => {
    try {
      if (editingSegment) {
        await updateSegment(editingSegment.id, data);
      } else {
        await addSegment(data);
      }
      closeForm();
    } catch (err) {
      alert("Error occurred!");
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSegment(null);
  };

  if (isLoading)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="p-8 max-w-6xl mx-auto bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">სეგმენტები</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> დამატება
        </button>
      </header>

      {isFormOpen && (
        <SegmentForm
          initialData={editingSegment}
          onSubmit={handleSave}
          onClose={closeForm}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments?.map((s) => (
          <SegmentCard
            key={s.id}
            segment={s}
            onEdit={(e, seg) => {
              e.preventDefault();
              setEditingSegment(seg);
              setIsFormOpen(true);
            }}
            onDelete={(e, id) => {
              e.preventDefault();
              if (confirm("Are you sure?")) removeSegment(id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
