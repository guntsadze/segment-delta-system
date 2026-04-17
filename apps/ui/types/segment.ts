import { z } from "zod";

export const segmentSchema = z.object({
  name: z.string(),
  type: z.enum(["DYNAMIC", "STATIC"]),
  rules: z.object({
    operator: z.enum(["AND", "OR"]),
    conditions: z.array(
      z.object({
        type: z.string(),
        days: z.number().optional().nullable(),
        inactiveDays: z.number().optional().nullable(),
        minAmount: z.number().optional().nullable(),
        minCount: z.number().optional().nullable(),
        segmentId: z.string().optional(),
      }),
    ),
  }),
});

export type SegmentFormValues = z.infer<typeof segmentSchema>;
