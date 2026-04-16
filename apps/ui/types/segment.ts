import { z } from "zod";

export const segmentSchema = z.object({
  name: z.string(),
  type: z.enum(["DYNAMIC", "STATIC"]),
  rules: z.object({
    operator: z.enum(["AND", "OR"]),
    conditions: z.array(
      z.object({
        type: z.string(),
        days: z.number(),
        minAmount: z.number(),
        minCount: z.number(),
        segmentId: z.string().optional(),
      }),
    ),
  }),
});

export type SegmentFormValues = z.infer<typeof segmentSchema>;
