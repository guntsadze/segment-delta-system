import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save, Plus, Trash2, Settings2, ChevronDown } from "lucide-react";
import { segmentSchema, SegmentFormValues } from "@/types/segment";

interface Props {
  initialData?: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export const SegmentForm = ({ initialData, onSubmit, onClose }: Props) => {
  const formattedInitialData = initialData
    ? {
        ...initialData,
        rules: {
          ...initialData.rules,
          conditions: initialData.rules.conditions.map((cond: any) => ({
            ...cond,
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
      name: "",
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
    const cleanedConditions = data.rules.conditions.map((condition) => {
      const { type, days, minAmount, minCount } = condition;

      switch (type) {
        case "MIN_SPEND_IN_DAYS":
          return { type, days, minAmount, minCount };

        case "MIN_TRANSACTIONS_IN_DAYS":
          return { type, days, minCount };

        case "INACTIVE_AFTER_ACTIVE":
          return {
            type,
            inactiveDays: days,
          };

        case "IN_SEGMENT":
          return { type };

        default:
          return { type };
      }
    });

    const finalData = {
      ...data,
      rules: {
        ...data.rules,
        conditions: cleanedConditions,
      },
    };

    onSubmit(finalData);
  };

  return (
    <div className="mb-10 bg-white p-8 rounded-2xl border border-slate-200 shadow-2xl max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(handleFinalSubmit)}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Settings2 size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {initialData ? "რედაქტირება" : "დამატება"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 ml-1">
              სახელი
            </label>
            <input
              {...register("name")}
              placeholder="e.g. VIP Customers"
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                errors.name ? "border-red-500" : "border-slate-200"
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 ml-1">
              განახლების ტიპი
            </label>
            <select
              {...register("type")}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="DYNAMIC">დინამიური (Auto-update)</option>
              <option value="STATIC">სტატიკური (Fixed list)</option>
            </select>
          </div>
        </div>

        {/* Rules Section */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                წესები და პირობები
              </h3>

              <div className="relative">
                <select
                  {...register("rules.operator")}
                  className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="AND">ყველა პირობა (AND)</option>
                  <option value="OR">რომელიმე (OR)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {fields.map((field, index) => {
              // ვუყურებთ მიმდინარე პირობის ტიპს
              const conditionType = watch(`rules.conditions.${index}.type`);

              return (
                <div
                  key={field.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap md:flex-nowrap gap-4 items-end"
                >
                  <div className="flex-1 min-w-[200px] space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Condition Type
                    </label>
                    <select
                      {...register(`rules.conditions.${index}.type`)}
                      className="w-full p-2 bg-slate-50 border-none rounded-lg text-sm font-medium"
                    >
                      <option value="MIN_TRANSACTIONS_IN_DAYS">
                        მინიმალური ტრანზაქცია
                      </option>
                      <option value="MIN_SPEND_IN_DAYS">
                        მინიმალური დახარჯვა
                      </option>
                      <option value="INACTIVE_AFTER_ACTIVE">
                        ბოლო აქტივობა
                      </option>
                      <option value="IN_SEGMENT">In Segment</option>
                    </select>
                  </div>

                  {/* დღეები - არ ჩანს IN_SEGMENT-ის დროს */}
                  {conditionType !== "IN_SEGMENT" && (
                    <div className="w-24 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        დღე
                      </label>
                      <input
                        type="number"
                        {...register(`rules.conditions.${index}.days`, {
                          valueAsNumber: true,
                        })}
                        className="w-full p-2 bg-slate-50 border-none rounded-lg text-sm"
                      />
                    </div>
                  )}

                  {/* თანხა - ჩანს მხოლოდ MIN_SPEND_IN_DAYS დროს */}
                  {conditionType === "MIN_SPEND_IN_DAYS" && (
                    <div className="w-28 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        თანხა
                      </label>
                      <input
                        type="number"
                        {...register(`rules.conditions.${index}.minAmount`, {
                          valueAsNumber: true,
                        })}
                        className="w-full p-2 bg-slate-50 border-none rounded-lg text-sm"
                        placeholder="Amount"
                      />
                    </div>
                  )}

                  {/* რაოდენობა - არ ჩანს ბოლო აქტივობის და IN_SEGMENT დროს */}
                  {conditionType !== "INACTIVE_AFTER_ACTIVE" &&
                    conditionType !== "IN_SEGMENT" && (
                      <div className="w-24 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          რაოდენობა
                        </label>
                        <input
                          type="number"
                          {...register(`rules.conditions.${index}.minCount`, {
                            valueAsNumber: true,
                          })}
                          className="w-full p-2 bg-slate-50 border-none rounded-lg text-sm"
                          placeholder="Count"
                        />
                      </div>
                    )}

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mb-0.5"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              );
            })}
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
            className="mt-4 w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={18} /> პირობის დამატება
          </button>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
          >
            გაუქმება
          </button>
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-slate-200 transition-all active:scale-95"
          >
            <Save size={18} /> შენახვა
          </button>
        </div>
      </form>
    </div>
  );
};
