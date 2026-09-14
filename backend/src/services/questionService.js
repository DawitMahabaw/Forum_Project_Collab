import Question from "../models/Question.js";
<<<<<<< HEAD
import QuestionVector from "../models/QuestionVector.js";
import { embedContent } from "../ai/gemini.js";

import env from "../config/env.js";

// ============================================================
// SEMANTIC SEARCH QUESTIONS
// ============================================================

const searchQuestionsSemanticService = async ({ query, k, threshold }) => {
    const resolvedK = k || env.semanticSearch.defaultK;
    const resolvedThreshold =
        threshold === undefined || threshold === null
            ? env.semanticSearch.recommendThreshold
            : threshold;

    const { success, embedding: queryVector } = await embedContent(
        query,
        "RETRIEVAL_QUERY",
    );

    if (!success) {
        const error = new Error(
            "The AI search service is temporarily unavailable. Please try again.",
        );
        error.statusCode = 502;
        throw error;
    }

    await backfillQuestionEmbeddings({ limit: 100 });
    const vectors = await QuestionVector.findAllReady();

    const ranked = rankVectorsAgainstQuery(queryVector, vectors, {
        k: resolvedK,
        threshold: resolvedThreshold,
    });

    const questions = await Question.findManyByIds(
        ranked.map((entry) => entry.questionId),
    );

    const scoreByQuestionId = new Map(
        ranked.map((entry) => [entry.questionId, entry.score]),
    );

    const data = questions.map((question) => ({
        ...question,
        score: scoreByQuestionId.get(question.id) ?? 0,
    }));

    return {
        data,
        meta: {
            total: data.length,
            k: resolvedK,
            threshold: resolvedThreshold,
            query,
            questionHash: null,
        },
    };
};

export {
    searchQuestionsSemanticService,
};
=======

// GET /api/questions
const getQuestionsService = async ({ search, onlyMine, userId }) => {
  const questions = await Question.findMany({
    search: search || null,
    userId: onlyMine ? userId : null,
  });

  return {
    questions,
    meta: {
      limit: 100,
      total: questions.length,
      sortBy: "newest",
      sortOrder: "desc",
    },
  };
};

export { getQuestionsService };
>>>>>>> bc1e00c (feat(service): add fetchQuestions service logic for T-10)
