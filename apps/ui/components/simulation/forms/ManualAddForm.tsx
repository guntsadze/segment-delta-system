"use client";
import { Controller, useForm } from "react-hook-form";
import { FormSelect, FormButton } from "@/components/ui/FormElements";
import { CustomerSelect } from "@/components/ui/CustomerSelect";

interface Props {
  segments: any[];
  customers: any;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export function ManualAddForm({
  segments,
  customers,
  onSubmit,
  loading,
}: Props) {
  const staticSegments = segments.filter((s) => s.type === "STATIC");
  const { register, handleSubmit, control } = useForm({
    defaultValues: { segmentId: "", customerId: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSelect
        label="სეგმენტი"
        options={staticSegments.map((s) => ({
          value: s.id,
          label: `${s.name} (${s.type})`,
        }))}
        {...register("segmentId")}
      />
      <CustomerSelect
        name="customerId"
        control={control}
        customers={customers}
      />
      <FormButton variant="dark" isLoading={loading} type="submit">
        სეგმენტში დამატება
      </FormButton>
    </form>
  );
}
