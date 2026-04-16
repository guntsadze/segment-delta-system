import * as z from "zod";

export const segmentSchema = z.object({
  name: z.string().min(2, "სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს"),
  type: z.enum(["DYNAMIC", "STATIC"]),
  rules: z.object({
    operator: z.enum(["AND", "OR"]),
    conditions: z
      .array(
        z.object({
          type: z.string().min(1, "ტიპი აუცილებელია"),
          days: z.number().min(0).optional().default(30),
          minAmount: z.number().min(0).optional().default(0),
          minCount: z.number().min(0).optional().default(1),
          segmentId: z.string().optional(),
        }),
      )
      .min(1, "მინიმუმ ერთი პირობა აუცილებელია"),
  }),
});

export type SegmentFormValues = z.infer<typeof segmentSchema>;
