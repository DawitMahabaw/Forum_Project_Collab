
import { generateContent } from "../ai/gemini.js";

// ============================================================
// ANSWER FIT
// ============================================================

// Evaluate whether a draft answer addresses the selected question.
const assessAnswerAgainstQuestionService = async ({ question, answerText }) => {
  // Build a prompt containing both question context and
  // the proposed answer.
  const prompt = `
You are reviewing a draft answer on a technical Q&A forum before
it gets submitted. Judge how well the draft answer addresses the
question below.

Question title: "${question.title}"
Question content:
"""
${question.content}
"""

Draft answer:
"""
${answerText}
"""

Respond with STRICT JSON ONLY, no markdown, no commentary,
matching exactly this shape:

{
  "level": "strong" | "partial" | "weak",
  "note": "one or two sentence explanation for the author"
}

Rules:
- "strong" means the answer directly and substantively solves
  the question.
- "partial" means the answer is relevant but incomplete, vague,
  or missing an important detail.
- "weak" means the answer barely relates to the question or is
  too shallow to help.
- The note should be constructive and specific.
`.trim();

  // Send the prompt to Gemini.
  const rawText = await generateContent(prompt);

  // Parse the structured AI response.
  const parsed = parseJsonResponse(rawText);

  // Accept only supported evaluation levels.
  const allowedLevels = ["strong", "partial", "weak"];
  const level = allowedLevels.includes(parsed.level) ? parsed.level : "partial";

  const note =
    typeof parsed.note === "string" && parsed.note.trim().length > 0
      ? parsed.note
      : "The AI could not generate detailed feedback for this answer.";

  return { level, note };
};

// ============================================================
// EXPORT
// ============================================================

export {
  assessAnswerAgainstQuestionService,
};