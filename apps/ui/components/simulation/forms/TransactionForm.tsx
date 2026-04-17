"use client";
import { useForm } from "react-hook-form";
import {
  FormInput,
  FormSelect,
  FormButton,
} from "@/components/ui/FormElements";

interface Props {
  customers: any[];
  onSubmit: (customerId: string, amount: number) => void;
  loading: boolean;
}

export function TransactionForm({ customers, onSubmit, loading }: Props) {
  const { register, handleSubmit } = useForm({
    defaultValues: { customerId: "", amount: 100 },
  });

  return (
    <form
      onSubmit={handleSubmit((d) => onSubmit(d.customerId, d.amount))}
      className="space-y-5"
    >
      <FormSelect
        label="მომხმარებელი"
        options={customers.map((c) => ({ value: c.id, label: c.name }))}
        {...register("customerId")}
      />
      <FormInput
        label="თანხა (GEL)"
        type="number"
        {...register("amount", { valueAsNumber: true })}
      />
      <FormButton variant="success" isLoading={loading} type="submit">
        ტრანზაქციის შესრულება
      </FormButton>
    </form>
  );
}
