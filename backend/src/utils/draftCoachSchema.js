import { z } from "zod";

// to validate gemini output
// Output validation protects our application from unexpected AI output
const draftCoachSchema = z.object({
  improvedTitle: z.string(),
  improvedContent: z.string(),

  suggestions: z
    .array(z.string())
    .min(1)
    .max(4),
});

export { draftCoachSchema };