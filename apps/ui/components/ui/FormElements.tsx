"use client";
import { forwardRef, ReactNode } from "react";

// --- INPUT COMPONENT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FormInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => (
    <div className="space-y-1 w-full">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
        {label}
      </label>
      <input
        {...props}
        ref={ref}
        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
      />
    </div>
  ),
);

// --- SELECT COMPONENT ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string | number; label: string }[];
}

export const FormSelect = ({ label, options, ...props }: SelectProps) => (
  <div className="space-y-1 w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
      {label}
    </label>
    <select
      {...props}
      className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm appearance-none"
    >
      <option value="">აირჩიეთ...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// --- PRIMARY BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "success" | "danger" | "dark";
  isLoading?: boolean;
}

export const FormButton = ({
  children,
  variant = "primary",
  isLoading,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",
    success: "bg-green-600 hover:bg-green-700 shadow-green-100",
    danger: "bg-red-600 hover:bg-red-700 shadow-red-100",
    dark: "bg-slate-900 hover:bg-black shadow-slate-200",
  };

  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${variants[variant]}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          სრულდება...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
