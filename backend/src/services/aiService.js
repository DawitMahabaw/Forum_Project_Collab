
import { generateContent } from "../ai/gemini.js";

// ------------------------------------------------------------
// PARSE JSON FROM AI RESPONSE
// ------------------------------------------------------------
const parseJsonResponse = (rawText) => {
  const cleaned = rawText
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    console.error(
      "Failed to parse AI JSON response:",
      parseError.message,
      rawText,
    );

    const error = new Error("The AI service returned an unexpected response.");
    error.statusCode = 502;
    throw error;
  }
};

// ============================================================
// ANSWER FIT
// ============================================================
const assessAnswerAgainstQuestionService = async ({ question, answerText }) => {
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

  const rawText = await generateContent(prompt);

  const parsed = parseJsonResponse(rawText);

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
  generateQuestionDraftCoachService,
  assessAnswerAgainstQuestionService,
};