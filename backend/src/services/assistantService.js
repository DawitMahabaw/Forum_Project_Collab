import pool from "../config/db.js";
import env from "../config/env.js";
import { embedContent, generateContent } from "../ai/gemini.js";
import { cosineSimilarity } from "../ai/vectorMath.js";
import QuestionVector from "../models/QuestionVector.js";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
import Document from "../models/Document.js";

// ============================================================
// APPLICATION SPECIFICATION & ARCHITECTURE KNOWLEDGE BASE
// ============================================================
const APPLICATION_KNOWLEDGE = [
  {
    topic: "Evangadi Forum Overview",
    keywords: ["what is evangadi forum", "evangadi", "about", "overview", "what is this platform"],
    content:
      "Evangadi Forum is an AI-powered full-stack developer Q&A community platform designed for tech students and developers. It allows community members to ask technical questions, post detailed answers, accept verified solutions, upvote helpful contributions, search questions semantically, and upload technical PDFs to query them using Retrieval-Augmented Generation (RAG).",
  },
  {
    topic: "Technology Stack & Architecture",
    keywords: ["tech stack", "technology", "stack", "node.js", "react", "mysql", "express", "architecture", "what is node.js"],
    content:
      "The Evangadi Forum architecture consists of: Frontend built with React 19, Vite, React Router 7, Framer Motion, and Lucide React. Backend powered by Node.js and Express 5 REST API. Database powered by MySQL 8 with connection pooling (mysql2). AI features powered by Google Gemini (Gemini Flash for generation and gemini-embedding-2 for vector embeddings).",
  },
  {
    topic: "Authentication & Security (JWT)",
    keywords: ["jwt", "authentication", "login", "register", "password", "security", "how does jwt login work", "google auth", "oauth"],
    content:
      "The platform implements secure user authentication using bcrypt password hashing, email verification tokens via Nodemailer, and JSON Web Tokens (JWT) for stateless session authorization. It also supports Google OAuth 2.0 social login. Protected API endpoints enforce JWT validation via authMiddleware, checking user active status and RBAC roles (User, Admin).",
  },
  {
    topic: "Knowledge Base & RAG Documents",
    keywords: ["rag", "what is rag", "retrieval augmented generation", "pdf", "documents", "upload pdf", "embeddings"],
    content:
      "Retrieval-Augmented Generation (RAG) is an AI technique that combines vector search retrieval with large language models to provide grounded, hallucination-free answers from custom documents. On Evangadi Forum, users can upload PDF documents in the RAG Documents page. The backend extracts text using pdf-parse, divides content into contextual chunks, embeds them with Gemini embedding model, and stores them in MySQL. Users can perform semantic search inside their PDFs or ask AI questions with source citations.",
  },
  {
    topic: "Semantic Search & Question Similarity",
    keywords: ["semantic search", "vector search", "similar questions", "cosine similarity"],
    content:
      "The forum uses Google Gemini embedding model to generate high-dimensional vector embeddings for questions. When users search or view a question, the platform performs cosine similarity comparisons to surface conceptually related questions even if they use different wording or synonyms.",
  },
];

// Common stop words to avoid false positive SQL matches on question words
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
  "in", "on", "at", "to", "for", "from", "with", "by", "about", "into", "through", "during",
  "before", "after", "above", "below", "up", "down", "out", "off", "over", "under",
  "how", "what", "why", "when", "where", "which", "who", "whom", "whose",
  "this", "that", "these", "those", "it", "its", "i", "you", "he", "she", "we", "they",
  "do", "does", "did", "have", "has", "had", "can", "could", "should", "would", "will", "shall", "may", "might"
]);

// Helper to sanitize search terms
const cleanQuery = (text) => (text || "").trim().toLowerCase();

// ============================================================
// SEARCH FORUM QUESTIONS & ANSWERS
// ============================================================
const searchForumSources = async (query, queryVector = null) => {
  const sources = [];
  const normalized = cleanQuery(query);

  try {
    // 1. Semantic search if vector available
    if (queryVector && queryVector.length) {
      const readyVectors = await QuestionVector.findAllReady();
      const scored = readyVectors
        .map((entry) => ({
          questionId: entry.questionId,
          score: cosineSimilarity(queryVector, entry.embedding),
        }))
        .filter((entry) => entry.score >= 0.45)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      if (scored.length > 0) {
        const questionIds = scored.map((s) => s.questionId);
        const questions = await Question.findManyByIds(questionIds);
        const scoreMap = new Map(scored.map((s) => [s.questionId, s.score]));

        for (const q of questions) {
          let topAnswer = null;
          try {
            const answers = await Answer.findManyByQuestionId(q.id);
            topAnswer = answers[0] || null;
          } catch {
            // Gracefully proceed without answers
          }

          sources.push({
            type: "forum",
            id: q.id,
            title: q.title,
            snippet: q.content ? q.content.slice(0, 300) : "",
            topAnswer: topAnswer ? topAnswer.content.slice(0, 300) : null,
            score: scoreMap.get(q.id) || 0.6,
            link: `/questions/${q.questionHash}`,
          });
        }
      }
    }

    // 2. Keyword fallback / booster if fewer than 2 semantic matches
    if (sources.length < 2 && normalized.length >= 3) {
      const words = normalized
        .split(/\s+/)
        .map((w) => w.replace(/[^a-z0-9]/gi, ""))
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
        .slice(0, 3);
      if (words.length > 0) {
        const likeConditions = words.map(() => "(LOWER(q.title) LIKE ? OR LOWER(q.content) LIKE ?)").join(" OR ");
        const params = [];
        words.forEach((w) => {
          params.push(`%${w}%`, `%${w}%`);
        });

        const [rows] = await pool.execute(
          `SELECT q.id, q.question_hash, q.title, q.content
           FROM questions q
           WHERE ${likeConditions}
           ORDER BY q.created_at DESC
           LIMIT 3`,
          params,
        );

        for (const row of rows) {
          if (!sources.some((s) => s.id === row.id)) {
            let topAnswer = null;
            try {
              const answers = await Answer.findManyByQuestionId(row.id);
              topAnswer = answers[0] || null;
            } catch {
              // Gracefully proceed without answers
            }

            sources.push({
              type: "forum",
              id: row.id,
              title: row.title,
              snippet: (row.content || "").slice(0, 300),
              topAnswer: topAnswer ? topAnswer.content.slice(0, 300) : null,
              score: 0.55,
              link: `/questions/${row.question_hash}`,
            });
          }
        }
      }
    }
  } catch (error) {
    console.warn("Forum search warning for assistant:", error.message);
  }

  return sources;
};

// ============================================================
// SEARCH USER'S UPLOADED RAG DOCUMENTS (PDFs)
// ============================================================
const searchUserPdfSources = async (userId, query, queryVector = null) => {
  if (!userId) return [];

  const sources = [];
  try {
    const readyChunks = await Document.findReadyChunksForUser(userId);
    if (!readyChunks || readyChunks.length === 0) return [];

    if (queryVector && queryVector.length) {
      const scoredChunks = readyChunks
        .map((chunk) => ({
          ...chunk,
          score: cosineSimilarity(queryVector, chunk.embedding),
        }))
        .filter((chunk) => chunk.score >= 0.48)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      for (const chunk of scoredChunks) {
        sources.push({
          type: "document",
          id: chunk.chunkId,
          documentId: chunk.documentId,
          title: chunk.documentTitle,
          chunkIndex: chunk.chunkIndex,
          snippet: chunk.content.slice(0, 350),
          score: chunk.score,
          link: "/rag-documents",
        });
      }
    } else {
      const normalized = cleanQuery(query);
      const matched = readyChunks
        .filter((c) => cleanQuery(c.content).includes(normalized))
        .slice(0, 3);

      for (const chunk of matched) {
        sources.push({
          type: "document",
          id: chunk.chunkId,
          documentId: chunk.documentId,
          title: chunk.documentTitle,
          chunkIndex: chunk.chunkIndex,
          snippet: chunk.content.slice(0, 350),
          score: 0.6,
          link: "/rag-documents",
        });
      }
    }
  } catch (error) {
    console.warn("User PDF search warning for assistant:", error.message);
  }

  return sources;
};

// ============================================================
// MATCH APPLICATION SPECIFICATION TOPICS
// ============================================================
const matchApplicationKnowledge = (query) => {
  const normalized = cleanQuery(query);
  const matched = [];

  for (const item of APPLICATION_KNOWLEDGE) {
    const matchesKeyword = item.keywords.some((kw) => normalized.includes(kw) || kw.includes(normalized));
    if (matchesKeyword) {
      matched.push({
        type: "application",
        title: item.topic,
        snippet: item.content,
        score: 0.85,
        link: null,
      });
    }
  }

  if (
    matched.length === 0 &&
    (normalized.includes("evangadi") ||
      normalized.includes("forum platform") ||
      normalized.includes("about the forum") ||
      normalized === "what is forum" ||
      normalized === "what is this app")
  ) {
    matched.push({
      type: "application",
      title: "Evangadi Forum Platform",
      snippet: APPLICATION_KNOWLEDGE[0].content,
      score: 0.7,
      link: null,
    });
  }

  return matched;
};

// ============================================================
// HEURISTIC / EXTRACTIVE FALLBACK ANSWER GENERATOR
// ============================================================
const generateFallbackAnswer = (query, sources) => {
  if (!sources || sources.length === 0) {
    return {
      answer: `I could not find information on "${query}" in the forum questions or your uploaded PDFs.\n\nYou can ask about topics discussed on the forum, our application features (like Node.js, JWT, RAG, React, or MySQL), or upload a relevant PDF in the **RAG Documents** section!`,
      sources: [],
      suggestedFollowUps: [
        "What is Node.js?",
        "How does JWT login work?",
        "What is RAG?",
        "What is Evangadi Forum?",
      ],
    };
  }

  let text = `Here is what I found regarding **"${query}"** from our forum knowledge base and application documentation:\n\n`;

  const topApp = sources.find((s) => s.type === "application");
  if (topApp) {
    text += `${topApp.snippet}\n\n`;
  }

  const forumSources = sources.filter((s) => s.type === "forum");
  if (forumSources.length > 0) {
    text += `### Related Forum Discussions:\n`;
    forumSources.forEach((f) => {
      text += `- **[${f.title}](${f.link})**: ${f.snippet.slice(0, 150)}...\n`;
      if (f.topAnswer) {
        text += `  > *Top Answer:* ${f.topAnswer.slice(0, 150)}...\n`;
      }
    });
    text += `\n`;
  }

  const docSources = sources.filter((s) => s.type === "document");
  if (docSources.length > 0) {
    text += `### Matched from your Uploaded PDFs:\n`;
    docSources.forEach((d) => {
      text += `- **${d.title}** (Section #${d.chunkIndex + 1}): "${d.snippet.slice(0, 180)}..."\n`;
    });
    text += `\n`;
  }

  return {
    answer: text.trim(),
    sources: sources.map((s) => ({
      type: s.type,
      title: s.title,
      snippet: s.snippet,
      link: s.link || null,
      score: s.score || 0.5,
    })),
    suggestedFollowUps: [
      "What is Node.js?",
      "How does JWT login work?",
      "What is RAG?",
      "What is Evangadi Forum?",
    ],
  };
};

// ============================================================
// MAIN ASSISTANT QUERY SERVICE
// ============================================================
export const queryAssistantService = async ({ message, history = [], userId = null, userName = null }) => {
  const query = (message || "").trim();
  if (!query) {
    const error = new Error("Message cannot be empty.");
    error.statusCode = 400;
    throw error;
  }

  // 1. Generate query embedding if available
  let queryVector = null;
  try {
    const embedRes = await embedContent(query, "RETRIEVAL_QUERY");
    if (embedRes && embedRes.success && Array.isArray(embedRes.embedding)) {
      queryVector = embedRes.embedding;
    }
  } catch (err) {
    console.warn("Query embedding not available:", err.message);
  }

  // 2. Retrieve sources across all domains
  const [forumSources, pdfSources, appSources] = await Promise.all([
    searchForumSources(query, queryVector),
    searchUserPdfSources(userId, query, queryVector),
    Promise.resolve(matchApplicationKnowledge(query)),
  ]);

  const allSources = [...appSources, ...pdfSources, ...forumSources];

  // 3. Prepare AI synthesis prompt
  let contextDescription = "";
  if (appSources.length > 0) {
    contextDescription += "\n--- APPLICATION ARCHITECTURE & DOCUMENTATION ---\n";
    appSources.forEach((s) => {
      contextDescription += `[App Doc: ${s.title}]\n${s.snippet}\n\n`;
    });
  }

  if (pdfSources.length > 0) {
    contextDescription += "\n--- USER'S UPLOADED PDF EXCERPTS ---\n";
    pdfSources.forEach((s) => {
      contextDescription += `[PDF: ${s.title} (Chunk #${s.chunkIndex + 1})]\n${s.snippet}\n\n`;
    });
  }

  if (forumSources.length > 0) {
    contextDescription += "\n--- FORUM QUESTIONS & ANSWERS ---\n";
    forumSources.forEach((s) => {
      contextDescription += `[Forum Question: "${s.title}" (Link: ${s.link})]\nQuestion Content: ${s.snippet}\n`;
      if (s.topAnswer) {
        contextDescription += `Community Answer: ${s.topAnswer}\n`;
      }
      contextDescription += `\n`;
    });
  }

  const recentHistory = (history || [])
    .slice(-4)
    .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
    .join("\n");

// Helper to strip repetitive "Hello <Name>!" or "Hello!" greetings from answer starts
const cleanGreetingPrefix = (text, userQuery) => {
  if (!text || typeof text !== "string") return "";
  const trimmed = text.trim();

  // If the user's message was specifically just a greeting, preserve the greeting
  const isPureGreeting =
    /^(hi|hello|hey|good morning|good afternoon|good evening|greetings)\b/i.test(
      userQuery.trim(),
    ) && userQuery.trim().split(/\s+/).length <= 3;
  if (isPureGreeting) {
    return trimmed;
  }

  // Strip repetitive leading greetings like "Hello Dawit!", "Hello!", "Hi Dawit,", etc.
  const stripped = trimmed
    .replace(
      /^(?:hello|hi|hey)(?:\s+[a-z0-9_.-]+)?(?:\s*!\s*|\s*,\s*|\s*\.\s*|\s*:\s*|\s*–\s*|\s*-\s*)/i,
      "",
    )
    .trim();

  if (!stripped) return trimmed;
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
};

  const systemPrompt = `
You are Evangadi Assistant, an intelligent and concise AI assistant for the AI-Powered Evangadi Forum platform.
Your purpose is to answer developer and student questions grounded in:
1. The questions and answers discussed on the Evangadi Forum.
2. The user's uploaded PDF technical documents (via RAG).
3. The Evangadi Forum full-stack application architecture (Node.js, Express, React, MySQL, Gemini AI, JWT auth, RAG, etc.).

GROUNDING AND BEHAVIOR RULES:
- NEVER start answers with repetitive greetings or salutations (such as "Hello ${userName || ""}", "Hello!", "Hi!", "Hey", etc.). The chat UI already displays the initial welcome greeting. Jump directly and cleanly into answering the question without conversational filler.
- Only if the user's message is strictly a casual greeting (such as "hi" or "hello") may you reply with a brief, friendly greeting. For all questions, queries, and technical topics, dive straight into the answer.
- Always ground your answers in the provided context below.
- Synthesize a helpful, well-structured explanation using markdown (bullet points, bold text, code blocks if appropriate).
- Explicitly mention where the information comes from (for example: "According to our platform documentation...", "From forum discussion on...", or "From your uploaded PDF document...").
- If the question is completely unrelated to the forum, programming concepts, the application, or uploaded documents, state politely:
  "I answer only from forum questions and answers, your uploaded PDFs, and our application documentation. I could not find information regarding that topic. Try asking about forum topics or upload a relevant PDF!"
- Return STRICT JSON ONLY (no extra conversational preamble), adhering to this schema:
{
  "answer": "Your markdown answer string here",
  "usedSources": [
    {
      "type": "forum" | "document" | "application",
      "title": "Title of the referenced question / document / doc topic",
      "snippet": "Short relevant quote or summary",
      "link": "Link URL if forum question or /rag-documents or null"
    }
  ],
  "suggestedFollowUps": ["Question suggestion 1", "Question suggestion 2"]
}

${recentHistory ? `RECENT CONVERSATION HISTORY:\n${recentHistory}\n` : ""}

AVAILABLE CONTEXT AND SOURCES:
${contextDescription || "No specific matches found in the forum or documents for this query."}

USER QUERY:
"${query}"
`.trim();

  try {
    const rawAiText = await generateContent(systemPrompt, {
      json: true,
      maxOutputTokens: 2048,
      temperature: 0.2,
    });

    let parsed = null;
    try {
      const cleaned = (rawAiText || "")
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      const jsonMatch = (rawAiText || "").match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          // Fall through to plain text
        }
      }
    }

    const rawAnswer = (parsed && typeof parsed.answer === "string" && parsed.answer.trim())
      ? parsed.answer.trim()
      : (typeof rawAiText === "string" && rawAiText.trim()) || generateFallbackAnswer(query, allSources).answer;

    const answer = cleanGreetingPrefix(rawAnswer, query);

    // Respect AI's explicitly chosen sources; only fall back if field was not returned
    const returnedSources = Array.isArray(parsed?.usedSources)
      ? parsed.usedSources
      : allSources.map((s) => ({
          type: s.type,
          title: s.title,
          snippet: s.snippet ? s.snippet.slice(0, 160) : "",
          link: s.link || null,
        }));

    const suggestedFollowUps = Array.isArray(parsed?.suggestedFollowUps) && parsed.suggestedFollowUps.length > 0
      ? parsed.suggestedFollowUps
      : [
          "What is Node.js?",
          "How does JWT login work?",
          "What is RAG?",
          "What is Evangadi Forum?",
        ];

    return {
      answer,
      sources: returnedSources,
      suggestedFollowUps,
    };
  } catch (aiError) {
    console.warn("AI generation failed or timed out, using fallback answer generator:", aiError.message);
    return generateFallbackAnswer(query, allSources);
  }
};
