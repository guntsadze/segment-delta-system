"use client";
import { Trash2 } from "lucide-react";
import { FormInput, FormSelect } from "@/components/ui/FormElements";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { SegmentFormValues } from "@/types/segment";

interface Props {
  index: number;
  register: UseFormRegister<SegmentFormValues>;
  watch: UseFormWatch<SegmentFormValues>;
  onRemove: (index: number) => void;
  segments: any[];
}

export const ConditionRow = ({
  index,
  register,
  watch,
  onRemove,
  segments,
}: Props) => {
  console.log("🚀 ~ ConditionRow ~ segments:", segments);
  const conditionType = watch(`rules.conditions.${index}.type`);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap md:flex-nowrap gap-4 items-end animate-in fade-in slide-in-from-top-1">
      {/* 1. პირობის ტიპის არჩევანი */}
      <div className="flex-1 min-w-[200px]">
        <FormSelect
          label="პირობის ტიპი"
          options={[
            {
              value: "MIN_TRANSACTIONS_IN_DAYS",
              label: "მინიმალური ტრანზაქცია",
            },
            { value: "MIN_SPEND_IN_DAYS", label: "მინიმალური დახარჯვა" },
            { value: "INACTIVE_AFTER_ACTIVE", label: "ბოლო აქტივობა" },
            { value: "ALL_CUSTOMERS", label: "ყველა მომხმარებელი" },
            { value: "IN_SEGMENT", label: "სეგმენტში ყოფნა (Chaining)" },
          ]}
          {...register(`rules.conditions.${index}.type`)}
        />
      </div>

      {/* 2. სეგმენტის არჩევანი (მხოლოდ IN_SEGMENT-ის დროს) */}
      {conditionType === "IN_SEGMENT" && (
        <div className="flex-[2] min-w-[200px]">
          <FormSelect
            label="აირჩიე სამიზნე სეგმენტი"
            options={
              segments?.map((s) => ({ value: s.id, label: s.name })) || []
            }
            {...register(`rules.conditions.${index}.segmentId` as any)}
          />
        </div>
      )}

      {/* 3. დღეების ველი (არ ჩანს IN_SEGMENT და ALL_CUSTOMERS დროს) */}
      {conditionType !== "IN_SEGMENT" && conditionType !== "ALL_CUSTOMERS" && (
        <div className="w-24">
          <FormInput
            label="დღე"
            type="number"
            {...register(`rules.conditions.${index}.days`, {
              valueAsNumber: true,
            })}
          />
        </div>
      )}

      {/* 4. თანხის ველი (მხოლოდ MIN_SPEND_IN_DAYS დროს) */}
      {conditionType === "MIN_SPEND_IN_DAYS" && (
        <div className="w-28">
          <FormInput
            label="თანხა"
            type="number"
            placeholder="Amount"
            {...register(`rules.conditions.${index}.minAmount`, {
              valueAsNumber: true,
            })}
          />
        </div>
      )}

      {/* 5. რაოდენობის ველი (მხოლოდ ტრანზაქციების და დახარჯვის დროს) */}
      {(conditionType === "MIN_TRANSACTIONS_IN_DAYS" ||
        conditionType === "MIN_SPEND_IN_DAYS") && (
        <div className="w-24">
          <FormInput
            label="რაოდენობა"
            type="number"
            placeholder="Count"
            {...register(`rules.conditions.${index}.minCount`, {
              valueAsNumber: true,
            })}
          />
        </div>
      )}

      {/* 6. წაშლის ღილაკი */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all mb-0.5"
        title="პირობის წაშლა"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};
