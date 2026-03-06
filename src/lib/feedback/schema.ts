import { z } from "zod";

const MAX_MESSAGE = 2000;
const MAX_SHORT = 200;

export const FEEDBACK_TYPES = ["bug", "feature", "content", "general"] as const;

export const FeedbackSchema = z.object({
  type: z.enum(FEEDBACK_TYPES),
  category: z
    .string()
    .trim()
    .max(MAX_SHORT, "Category is too long")
    .optional()
    .nullable(),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(MAX_MESSAGE, `Message must be at most ${MAX_MESSAGE} characters`),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .nullable()
    .or(z.literal("")),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5")
    .optional()
    .nullable(),
  roadmapSlug: z.string().trim().max(MAX_SHORT).optional().nullable(),
  phaseId: z.string().trim().max(MAX_SHORT).optional().nullable(),
  topicId: z.string().trim().max(MAX_SHORT).optional().nullable(),
  pagePath: z.string().trim().max(MAX_SHORT).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export type FeedbackInput = z.infer<typeof FeedbackSchema>;
