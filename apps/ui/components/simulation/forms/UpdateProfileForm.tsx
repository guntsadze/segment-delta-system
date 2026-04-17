"use client";
import { useForm } from "react-hook-form";
import {
  FormInput,
  FormSelect,
  FormButton,
} from "@/components/ui/FormElements";

interface UpdateProfileProps {
  customers: { id: string; name: string }[];
  onSubmit: (customerId: string, name: string) => void;
  loading: boolean;
}

export function UpdateProfileForm({
  customers,
  onSubmit,
  loading,
}: UpdateProfileProps) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { customerId: "", name: "" },
  });

  const handleFormSubmit = (data: { customerId: string; name: string }) => {
    onSubmit(data.customerId, data.name);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="space-y-4">
        <FormSelect
          label="აირჩიე მომხმარებელი"
          options={customers.map((c) => ({
            value: c.id,
            label: c.name,
          }))}
          {...register("customerId", { required: true })}
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
