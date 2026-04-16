"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { socket } from "@/lib/socket";
import { Users, Activity, Lock, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";

export default function SegmentsPage() {
  const [segments, setSegments] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const createSegment = async () => {
    const defaultRules = {
      operator: "AND",
      conditions: [{ type: "MIN_TRANSACTIONS_IN_DAYS", days: 30, minCount: 1 }],
    };

    const res = await apiFetch("/segments", {
      method: "POST",
      body: JSON.stringify({
        name: newName,
        type: "DYNAMIC",
        rules: defaultRules,
      }),
    });

    setSegments([res, ...segments]);
    setIsCreating(false);
    setNewName("");
  };

  const deleteSegment = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // რომ ბარათზე დაჭერამ არ გადაგვიყვანოს დეტალებში
    if (confirm("Are you sure you want to delete this segment?")) {
      await apiFetch(`/segments/${id}`, { method: "DELETE" });
      setSegments(segments.filter((s) => s.id !== id));
    }
  };

  useEffect(() => {
    // 1. მონაცემების წამოღება
    apiFetch("/segments").then(setSegments);

    // 2. რეალურ დროში განახლების მოსმენა
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

      // მოვაცილოთ პულსაცია 2 წამში
      setTimeout(() => {
        setSegments((prev) => prev.map((s) => ({ ...s, pulse: false })));
      }, 2000);
    });

    return () => {
      socket.off("segment:counts_update");
    };
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Customer Segments</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Create Segment
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-200 flex gap-4 items-end animate-in fade-in zoom-in duration-200">
          <div className="flex-1">
            <label className="block text-sm font-bold mb-1 text-blue-900">
              New Segment Name
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Active Shoppers"
            />
          </div>
          <button
            onClick={createSegment}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
          >
            Save
          </button>
          <button
            onClick={() => setIsCreating(false)}
            className="bg-slate-200 px-6 py-2 rounded-lg font-bold"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map((segment) => (
          <Link key={segment.id} href={`/segments/${segment.id}`}>
            <div
              className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group ${segment.pulse ? "ring-2 ring-green-400 scale-105" : ""}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-2 rounded-lg ${segment.type === "DYNAMIC" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}
                >
                  {segment.type === "DYNAMIC" ? (
                    <Activity size={20} />
                  ) : (
                    <Lock size={20} />
                  )}
                </div>
                <span className="text-slate-400 group-hover:text-blue-500 transition">
                  <ArrowRight size={20} />
                </span>
              </div>

              <h3 className="font-bold text-lg mb-1">{segment.name}</h3>
              <p className="text-slate-500 text-sm mb-4 line-clamp-1">
                {segment.type} Segment
              </p>

              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Users size={18} className="text-slate-400" />
                <span className="text-2xl">{segment.memberCount}</span>
                <span className="text-sm font-normal text-slate-400">
                  members
                </span>
                <button onClick={(e) => deleteSegment(e, segment.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
