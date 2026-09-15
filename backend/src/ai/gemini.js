const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL;

export async function embedContent(text, taskType = "RETRIEVAL_DOCUMENT") {
  if (!GEMINI_API_KEY || !GEMINI_MODEL || GEMINI_MODEL.includes("your_actual")) {
    const error = new Error("Gemini API key or model is not configured.");
    error.statusCode = 502;
    return { success: false, error, embedding: null };
  }

  try {
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `${GEMINI_MODEL}:embedContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${GEMINI_MODEL}`,
        content: { parts: [{ text }] },
        taskType,
      }),
    });

    if (!response.ok) {
      const error = new Error(
        `Gemini API error (${response.status}): ${await response.text()}`,
      );
      error.statusCode = 502;
      return { success: false, error, embedding: null };
    }

    const data = await response.json();
    const embedding = data.embedding?.values ?? null;
    if (!embedding) {
      const error = new Error("Gemini API returned no embedding values.");
      error.statusCode = 502;
      return { success: false, error, embedding: null };
    }

    return { success: true, embedding };
  } catch (error) {
    error.statusCode = 502;
    return { success: false, error, embedding: null };
  }
}

// =============================================================
//                   GENERATE CONTENT
// =============================================================

// Generate text using the configured Gemini model.
const generateContent = async (prompt) => {
  // Fail early when the API key is missing.
  assertApiKeyConfigured();

  // Try the primary model and configured fallback model.
  for (const model of generationModels()) {
    const response = await requestGemini({
      model,
      operation: "generateContent",
      endpoint: "generateContent",
      attempts: GENERATION_ATTEMPTS_PER_MODEL,

      // Send the evaluation prompt to Gemini.
      payload: {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
    });

    // Try the next model when Gemini returns an error.
    if (!response.ok) {
      continue;
    }

    const data = parseJson(response.body, model, "generateContent");

    // Extract generated text from Gemini's response.
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (text) {
      return text;
    }
  }

  // Return a service error when all Gemini models fail.
  const error = new Error(
    "The AI service is busy right now. Please try again in a moment.",
  );
  error.statusCode = 503;
  throw error;
};;