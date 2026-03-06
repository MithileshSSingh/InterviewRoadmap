import { z } from "zod";

const FEEDBACK_TYPES = ["bug", "feature", "content", "general"] as const;

function sanitizeString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

const MetadataSchema = z.record(z.string(), z.unknown()).optional();

export const FeedbackInputSchema = z.object({
  type: z.enum(FEEDBACK_TYPES),
  category: z
    .string()
    .optional()
    .transform((value) => sanitizeString(value, 80)),
  message: z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().min(10, "Message must be at least 10 characters").max(4000)),
  email: z
    .string()
    .optional()
    .transform((value) => sanitizeString(value, 160))
    .refine((value) => !value || z.email().safeParse(value).success, {
      message: "Invalid email format",
    }),
  rating: z
    .number()
    .int()
    .min(1)
    .max(5)
    .optional(),
  roadmapSlug: z
    .string()
    .optional()
    .transform((value) => sanitizeString(value, 80)),
  phaseId: z
    .string()
    .optional()
    .transform((value) => sanitizeString(value, 80)),
  topicId: z
    .string()
    .optional()
    .transform((value) => sanitizeString(value, 120)),
  pagePath: z
    .string()
    .optional()
    .transform((value) => sanitizeString(value, 300)),
  metadata: MetadataSchema,
});

export type FeedbackInput = z.infer<typeof FeedbackInputSchema>;
