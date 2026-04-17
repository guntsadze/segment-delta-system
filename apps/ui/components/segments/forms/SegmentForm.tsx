"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save } from "lucide-react";
import { segmentSchema, SegmentFormValues } from "@/types/segment";
import {
  FormInput,
  FormSelect,
  FormButton,
} from "@/components/ui/FormElements";
import { ConditionRow } from "./ConditionRow";

interface Props {
  initialData?: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
  availableSegments: any[];
}

export const SegmentForm = ({
  initialData,
  onSubmit,
  onClose,
  availableSegments,
}: Props) => {
  const formattedInitialData = initialData
    ? {
        ...initialData,
        rules: {
          ...initialData.rules,
          conditions: initialData?.rules?.conditions?.map((cond: any) => ({
            ...cond,
            segmentId: cond.segmentId,
            days:
              cond.type === "INACTIVE_AFTER_ACTIVE"
                ? cond.inactiveDays
                : cond.days,
          })),
        },
      }
    : undefined;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SegmentFormValues>({
    resolver: zodResolver(segmentSchema),
    defaultValues: formattedInitialData || {
      name: "ახალი სეგმენტი",
      type: "DYNAMIC",
      rules: {
        operator: "AND",
        conditions: [
          { type: "MIN_SPEND_IN_DAYS", days: 30, minAmount: 100, minCount: 1 },
        ],
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules.conditions",
  });

  const handleFinalSubmit = (data: SegmentFormValues) => {
    // მონაცემების გასუფთავების ლოგიკა (იგივე, რაც გქონდა)
    const cleanedConditions = data.rules.conditions.map((condition) => {
      const { type, days, minAmount, minCount } = condition;
      if (type === "INACTIVE_AFTER_ACTIVE") return { type, inactiveDays: days };
      if (type === "MIN_TRANSACTIONS_IN_DAYS") return { type, days, minCount };
      if (type === "IN_SEGMENT")
        return { type, segmentId: condition.segmentId };
      if (type === "MIN_SPEND_IN_DAYS")
        return { type, days, minAmount, minCount };
      return { type };
    });

    onSubmit({
      ...data,
      rules: { ...data.rules, conditions: cleanedConditions },
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFinalSubmit)} className="space-y-8">
      {/* Basic Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label="სეგმენტის სახელი"
          placeholder="მაგ: VIP კლიენტები"
          {...register("name")}
        />
        <FormSelect
          label="განახლების ტიპი"
          options={[
            { value: "DYNAMIC", label: "დინამიური (Auto-update)" },
            { value: "STATIC", label: "სტატიკური (Fixed list)" },
          ]}
          {...register("type")}
        />
      </div>

      {/* Rules Section */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            პირობები
          </h3>
          <div className="w-48">
            <FormSelect
              label=""
              options={[
                { value: "AND", label: "ყველა პირობა (AND)" },
                { value: "OR", label: "რომელიმე (OR)" },
              ]}
              {...register("rules.operator")}
            />
          </div>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <ConditionRow
              key={field.id}
              index={index}
              register={register}
              watch={watch}
              onRemove={remove}
              segments={availableSegments}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            append({
              type: "MIN_SPEND_IN_DAYS",
              days: 30,
              minAmount: 100,
              minCount: 1,
            })
          }
          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-bold text-sm"
        >
          <Plus size={18} /> პირობის დამატება
        </button>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all"
        >
          გაუქმება
        </button>
        <div className="w-48">
          <FormButton variant="dark" type="submit">
            <div className="flex items-center justify-center gap-2">
              <Save size={18} /> შენახვა
            </div>
          </FormButton>
        </div>
      </div>
    </form>
  );
};
