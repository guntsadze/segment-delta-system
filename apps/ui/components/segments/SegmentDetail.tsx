"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Users, RefreshCw, ChevronLeft, Activity } from "lucide-react";
import { useSegmentDetails } from "@/hooks/use-segment-details";
import { LoadMoreTrigger } from "../ui/load-more-trigger";

export function SegmentDetailView() {
  const { id } = useParams();
  const { deltas, segment, members, loading, refreshSegment } =
    useSegmentDetails(id as string);
  const { items: deltaLogs, isLoading, hasMore, loadMore } = deltas;

  const {
    items: memberList,
    isLoading: isMembersLoading,
    hasMore: hasMoreMembers,
    loadMore: loadMoreMembers,
  } = members;

  const getLogColor = (type: string) => {
    switch (type) {
      case "added":
        return "text-green-400";
      case "removed":
        return "text-red-400";
      case "mixed":
        return "text-orange-400";
      case "action":
        return "text-purple-300";
      default:
        return "text-blue-300";
    }
  };

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
              <Users size={16} /> {segment?._count?.members || 0} სეგმენტის
              წევრები
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
        <div className=" max-h-[600px] overflow-y-auto lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left ">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">სახელი</th>
                <th className="px-6 py-4">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memberList.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium">{m.name}</td>
                  <td className="px-6 py-4 text-slate-500">{m.email}</td>
                </tr>
              ))}

              {hasMoreMembers && (
                <td colSpan={3}>
                  <LoadMoreTrigger
                    onLoadMore={loadMoreMembers}
                    isLoading={isMembersLoading}
                    hasMore={hasMoreMembers}
                  />
                </td>
              )}
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
            {deltaLogs.map((log, index) => (
              <div
                key={`${log.id}-${index}`}
                className="flex gap-3 animate-in fade-in slide-in-from-left duration-300"
              >
                <span className="text-slate-500">[{log.time}]</span>
                <span className={getLogColor(log.type)}>{log.message}</span>
              </div>
            ))}
            {deltaLogs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-40">
                <Activity size={32} className="mb-2" />
                <p>...</p>
              </div>
            )}
            <LoadMoreTrigger
              onLoadMore={loadMore}
              isLoading={isLoading}
              hasMore={hasMore}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
