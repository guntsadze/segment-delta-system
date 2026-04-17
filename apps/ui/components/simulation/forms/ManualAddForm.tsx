"use client";
import { useForm } from "react-hook-form";
import { FormSelect, FormButton } from "@/components/ui/FormElements";

interface Props {
  segments: any[];
  customers: any[];
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
  const { register, handleSubmit } = useForm({
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
      <FormSelect
        label="მომხმარებელი"
        options={customers.map((c) => ({ value: c.id, label: c.name }))}
        {...register("customerId")}
      />
      <FormButton variant="dark" isLoading={loading} type="submit">
        სეგმენტში დამატება
      </FormButton>
    </form>
  );
}
