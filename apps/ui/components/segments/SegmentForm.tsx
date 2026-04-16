import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save, Plus, Trash2, Activity } from "lucide-react";
import { segmentSchema, SegmentFormValues } from "@/types/segment";

interface Props {
  initialData?: any;
  onSubmit: (data: SegmentFormValues) => void;
  onClose: () => void;
}

export const SegmentForm = ({ initialData, onSubmit, onClose }: Props) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SegmentFormValues>({
    resolver: zodResolver(segmentSchema),
    defaultValues: initialData || {
      name: "",
      type: "DYNAMIC",
      rules: {
        operator: "AND",
        conditions: [{ type: "MIN_SPEND_IN_DAYS", days: 30, minAmount: 100 }],
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules.conditions",
  });

  return (
    <div className="mb-10 bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold">
            {initialData ? "Edit Segment" : "New Segment"}
          </h2>
          <button type="button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <input
            {...register("name")}
            placeholder="Name"
            className="p-3 border rounded-xl"
          />
          <select {...register("type")} className="p-3 border rounded-xl">
            <option value="DYNAMIC">Dynamic</option>
            <option value="STATIC">Static</option>
          </select>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 mb-3 items-end">
              <select
                {...register(`rules.conditions.${index}.type`)}
                className="flex-1 p-2 rounded-lg"
              >
                <option value="MIN_SPEND_IN_DAYS">Spend</option>
                <option value="MIN_TRANSACTIONS_IN_DAYS">Orders</option>
              </select>
              <input
                type="number"
                {...register(`rules.conditions.${index}.days`, {
                  valueAsNumber: true,
                })}
                className="w-20 p-2 rounded-lg"
              />
              <button type="button" onClick={() => remove(index)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              append({ type: "MIN_SPEND_IN_DAYS", days: 30, minAmount: 500 })
            }
            className="text-blue-600 mt-2 flex items-center gap-1"
          >
            <Plus size={16} /> Add Rule
          </button>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={onClose}>
            Discard
          </button>
          <button
            type="submit"
            className="bg-slate-900 text-white px-8 py-2 rounded-xl flex items-center gap-2"
          >
            <Save size={18} /> Save
          </button>
        </div>
      </form>
    </div>
  );
};
