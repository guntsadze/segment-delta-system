import { Activity, Lock, Edit2, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SegmentCardProps {
  segment: any;
  onEdit: (e: React.MouseEvent, s: any) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export const SegmentCard = ({
  segment,
  onEdit,
  onDelete,
}: SegmentCardProps) => {
  return (
    <Link href={`/segments/${segment.id}`}>
      <div
        className={`group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 relative ${segment.pulse ? "ring-2 ring-green-400 scale-[1.02]" : ""}`}
      >
        <div className="flex justify-between items-start mb-6">
          <div
            className={`p-3 rounded-xl ${segment.type === "DYNAMIC" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}
          >
            {segment.type === "DYNAMIC" ? (
              <Activity size={22} />
            ) : (
              <Lock size={22} />
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => onEdit(e, segment)}
              className="p-2 text-slate-400 hover:text-blue-600 rounded-lg"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={(e) => onDelete(e, segment.id)}
              className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-1">
          {segment.name}
        </h3>
        <p className="text-slate-400 text-xs font-bold uppercase mb-4">
          {segment.type}
        </p>
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              წევრების რაოდენობა
            </span>
            <span className="text-xl font-bold text-slate-900">
              {segment.memberCount ?? segment._count?.members ?? 0}
            </span>
          </div>

          <div className="text-blue-600 font-semibold text-sm flex items-center gap-1 hover:text-blue-700 cursor-pointer transition-colors">
            დეტალები <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
};
