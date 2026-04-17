"use client";
import { PlusCircle, FastForward, UserSquare2, Zap } from "lucide-react";

interface SidebarProps {
  onAction: (actionType: "transaction" | "time" | "update") => void;
}

export function SimulationSidebar({ onAction }: SidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-4">
      {/* --- QUICK ACTIONS GROUP --- */}
      <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-sm">
        <SidebarActionButton
          icon={<PlusCircle className="text-green-500" />}
          label="ტრანზაქცია"
          desc="თანხის იმიტირებული მოძრაობა"
          onClick={() => onAction("transaction")}
        />

        <SidebarActionButton
          icon={<FastForward className="text-orange-500" />}
          label="დროში გადასვლა"
          desc="მომავალში გადახტომა (Days)"
          onClick={() => onAction("time")}
        />

        <SidebarActionButton
          icon={<UserSquare2 className="text-purple-500" />}
          label="პროფილის შეცვლა"
          desc="მომხმარებლის რედაქტირება"
          onClick={() => onAction("update")}
        />
      </div>

      {/* --- INFO CARD --- */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 border-b-4 border-blue-800 relative overflow-hidden group">
        <Zap
          className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform duration-500"
          size={100}
        />
        <div className="relative z-10">
          <Zap className="mb-4 opacity-80" size={24} />

          <p className="text-blue-100 text-xs mt-2 leading-relaxed opacity-90">
            ყველა ცვლილება მყისიერად აისახება მონაცემთა ბაზაში. სისტემა
            ავტომატურად გადათვლის სეგმენტებს. გარდა სტატიკური სეგმენტებისა
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Internal Helper Component ---
interface ActionBtnProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  onClick: () => void;
}

function SidebarActionButton({ icon, label, desc, onClick }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-3 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 rounded-xl transition-all duration-200 group border border-transparent hover:border-slate-100"
    >
      <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-sm font-bold text-slate-700 leading-none group-hover:text-blue-600 transition-colors">
          {label}
        </p>
        <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-none">
          {desc}
        </p>
      </div>
    </button>
  );
}
