"use client";
import { Database } from "lucide-react";

interface StressTestProps {
  onImport: (amount: number) => void;
  loading: boolean;
}

export function StressTestActions({ onImport, loading }: StressTestProps) {
  const amounts = [100, 1000, 10000];

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 mb-4 px-1">
        აირჩიეთ მომხმარებლების რაოდენობა, რომლის იმპორტიც გსურთ სისტემაში.
      </p>

      {amounts.map((amt) => (
        <button
          key={amt}
          disabled={loading}
          onClick={() => onImport(amt)}
          className={`w-full p-4 rounded-2xl border-2 flex justify-between items-center transition-all group disabled:opacity-50 ${
            amt === 10000
              ? "border-red-100 hover:bg-red-50 text-red-700 hover:border-red-200"
              : "border-slate-100 hover:bg-slate-50 text-slate-700 hover:border-slate-200"
          }`}
        >
          <div className="text-left">
            <p className="font-black text-xl leading-none">
              {amt.toLocaleString()}
            </p>
            <p className="text-[10px] uppercase font-bold opacity-60 mt-1 tracking-wider">
              მომხმარებელი
            </p>
          </div>
          <Database
            size={24}
            className="opacity-20 group-hover:opacity-40 transition-opacity"
          />
        </button>
      ))}
    </div>
  );
}
