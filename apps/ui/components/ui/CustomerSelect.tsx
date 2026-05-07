import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { useState } from "react";

interface SelectOption {
  value: string | number;
  label: string;
}

interface CustomerSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  customers: {
    items: { id: string | number; name: string }[];
    isLoading: boolean;
    hasMore: boolean;
    loadMore: () => void;
  };
  extraOptions?: SelectOption[];
}

export const CustomerSelect = <T extends FieldValues>({
  control,
  name,
  label = "მომხმარებელი",
  customers,
  extraOptions = [],
}: CustomerSelectProps<T>) => {
  const combinedOptions = [
    ...extraOptions,
    ...customers.items.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormSelect
          {...field}
          label={label}
          options={combinedOptions}
          isLoading={customers.isLoading}
          hasMore={customers.hasMore}
          onLoadMore={customers.loadMore}
        />
      )}
    />
  );
};

interface Props {
  label: string;
  options: { value: string | number; label: string }[];
  value?: any;
  onChange: (val: any) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

const FormSelect = ({
  label,
  options,
  value,
  onChange,
  onLoadMore,
  isLoading,
  hasMore,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel =
    options.find((opt) => String(opt.value) === String(value))?.label ||
    "აირჩიეთ...";

  return (
    <div className="flex flex-col gap-1 w-full relative">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
        {label}
      </label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer text-sm flex justify-between items-center"
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {selectedLabel}
        </span>
        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            onScroll={(e) => {
              const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
              if (
                scrollHeight - scrollTop <= clientHeight + 5 &&
                hasMore &&
                !isLoading
              )
                onLoadMore?.();
            }}
            className="absolute z-50 top-[105%] w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto"
          >
            {options.map((opt, i) => (
              <div
                key={i}
                className={`p-3 hover:bg-slate-50 cursor-pointer text-sm ${value === opt.value ? "text-blue-600 font-bold" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
