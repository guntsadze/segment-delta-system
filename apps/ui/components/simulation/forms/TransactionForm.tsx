"use client";
import { Controller, useForm } from "react-hook-form";
import {
  FormInput,
  FormSelect,
  FormButton,
} from "@/components/ui/FormElements";
import { CustomerSelect } from "@/components/ui/CustomerSelect";

interface Props {
  customers: any;
  onSubmit: (customerId: string, amount: number, count: number) => void;
  loading: boolean;
}

export function TransactionForm({ customers, onSubmit, loading }: Props) {
  const { register, handleSubmit, control } = useForm({
    defaultValues: { customerId: "", amount: 100, count: 1 },
  });

  return (
    <form
      onSubmit={handleSubmit((d) => {
        onSubmit(d.customerId, d.amount, d.count);
        console.log(d);
      })}
      className="space-y-5"
    >
      <CustomerSelect
        name="customerId"
        control={control}
        customers={customers}
      />
      <FormInput
        label="თანხა (GEL)"
        type="number"
        {...register("amount", { valueAsNumber: true })}
      />
      <FormInput
        label="ტრანზაქციის რაოდენობა"
        type="number"
        {...register("count", { valueAsNumber: true })}
      />
      <FormButton variant="success" isLoading={loading} type="submit">
        ტრანზაქციის შესრულება
      </FormButton>
    </form>
  );
}
