"use client";
import { useForm } from "react-hook-form";
import { FormInput, FormButton } from "@/components/ui/FormElements";
import { CustomerSelect } from "@/components/ui/CustomerSelect";

interface UpdateProfileProps {
  customers: any;
  onSubmit: (customerId: string, name: string) => void;
  loading: boolean;
}

export function UpdateProfileForm({
  customers,
  onSubmit,
  loading,
}: UpdateProfileProps) {
  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: { customerId: "", name: "" },
  });

  const handleFormSubmit = (data: { customerId: string; name: string }) => {
    onSubmit(data.customerId, data.name);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="space-y-4">
        <CustomerSelect
          name="customerId"
          control={control}
          customers={customers}
        />

        <FormInput
          label="ახალი სახელი"
          placeholder="მაგ: გიორგი ბერიძე"
          type="text"
          {...register("name", { required: true })}
        />
      </div>

      <FormButton variant="primary" isLoading={loading} type="submit">
        მონაცემების განახლება
      </FormButton>
    </form>
  );
}
