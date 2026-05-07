"use client";
import { useForm } from "react-hook-form";
import { FormInput, FormButton } from "@/components/ui/FormElements";
import { CustomerSelect } from "@/components/ui/CustomerSelect";

interface TimeTravelProps {
  customers: any;
  onSubmit: (days: number, target: string) => void;
  loading: boolean;
}

export function TimeTravelForm({
  customers,
  onSubmit,
  loading,
}: TimeTravelProps) {
  const { register, handleSubmit, control } = useForm({
    defaultValues: { target: "all", days: 30 },
  });

  return (
    <form
      onSubmit={handleSubmit((d) => onSubmit(d.days, d.target))}
      className="space-y-5"
    >
      <CustomerSelect
        name="target"
        control={control}
        label="ვისზე გავრცელდეს?"
        customers={customers}
        extraOptions={[{ value: "all", label: "🌍 ყველა (Global Update)" }]}
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
