"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  RefreshCw,
  ChevronLeft,
  Activity,
  Clock,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { useSegmentDetails } from "@/hooks/use-segment-details";

export function SegmentDetailView() {
  const { id } = useParams();
  const { segment, members, feed, loading, refreshSegment } = useSegmentDetails(
    id as string,
  );

  if (loading)
    return <div className="p-8 text-center animate-pulse">იტვირთება...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col gap-2 mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition"
        >
          <ChevronLeft size={20} /> მთავარი გვერდი
        </Link>
        <Link
          href="/segments"
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition"
        >
          <ChevronLeft size={20} /> სეგმენტები
        </Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{segment?.name}</h1>
          <div className="flex gap-4 text-sm">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
              {segment?.type}
            </span>
            <span className="text-slate-500 flex items-center gap-1">
              <Users size={16} /> {members.length} სეგმენტის წევრები
            </span>
          </div>
        </div>
        <button
          onClick={refreshSegment}
          className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw size={18} /> განახლება
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* წევრების ცხრილი */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">სახელი</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">სტატუსი</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium">{m.name}</td>
                  <td className="px-6 py-4 text-slate-500">{m.email}</td>
                  <td className="px-6 py-4 text-green-500 text-sm font-medium">
                    Active
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live Delta Feed */}
        <div className="bg-slate-900 rounded-xl p-6 text-white h-[600px] flex flex-col shadow-xl">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />{" "}
            Live მონაცემები
          </h3>
          <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            {feed.map((event) => (
              <div
                key={event.id}
                className="border-l-2 border-slate-700 pl-4 py-1 animate-in slide-in-from-right"
              >
                <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                  <Clock size={10} /> {event.timestamp}
                </div>
                {event.addedCount > 0 && (
                  <div className="text-green-400 text-sm">
                    <div className="flex items-center gap-2">
                      <UserPlus size={14} />
                      <span>{event.addedCount} დაემატა:</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pl-6 break-words italic">
                      {event.addedSummary}
                    </div>
                  </div>
                )}

                {event.removedCount > 0 && (
                  <div className="text-red-400 text-sm mt-2">
                    <div className="flex items-center gap-2">
                      <UserMinus size={14} />
                      <span>{event.removedCount} გავიდა:</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pl-6 break-words italic">
                      {event.removedSummary}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {feed.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-40">
                <Activity size={32} className="mb-2" />
                <p>...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
