"use client";
import { useForm } from "react-hook-form";
import {
  FormSelect,
  FormInput,
  FormButton,
} from "@/components/ui/FormElements";

interface TimeTravelProps {
  customers: { id: string; name: string }[];
  onSubmit: (days: number, target: string) => void;
  loading: boolean;
}

export function TimeTravelForm({
  customers,
  onSubmit,
  loading,
}: TimeTravelProps) {
  const { register, handleSubmit } = useForm({
    defaultValues: { target: "all", days: 30 },
  });

  return (
    <form
      onSubmit={handleSubmit((d) => onSubmit(d.days, d.target))}
      className="space-y-5"
    >
      <FormSelect
        label="ვისზე გავრცელდეს?"
        options={[
          { value: "all", label: "🌍 ყველა (Global Update)" },
          ...customers.map((c) => ({ value: c.id, label: `👤 ${c.name}` })),
        ]}
        {...register("target")}
      />

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <FormInput
            label="დღეების რაოდენობა"
            type="number"
            {...register("days", { valueAsNumber: true })}
          />
        </div>
        <div className="w-1/3">
          <FormButton variant="dark" isLoading={loading} type="submit">
            მატება
          </FormButton>
        </div>
      </div>
    </form>
  );
}
