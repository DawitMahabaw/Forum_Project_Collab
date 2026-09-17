import Question from "../models/Question.js";
import QuestionVector from "../models/QuestionVector.js";
import { embedContent } from "../ai/gemini.js";

import env from "../config/env.js";

// ============================================================
// GET QUESTIONS SERVICE (T-10)
// ============================================================

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


// ============================================================
// SINGLE QUESTION DETAILS SERVICE 
// ============================================================
const getSingleQuestionService = async (questionHash) => {
  // Retrieve the requested question by public hash
  const question = await Question.findByHash(questionHash);

  //Handle question-not-found cases safely
  if (!question) {
    const error = new Error("Question not found.");
    error.statusCode = 404;
    throw error;
  }

  // Retrieve related answers using the internal question ID
  const answers = await Answer.findManyByQuestionId(question.id);

  // TASK REQUIREMENT: Return question and discussion information
  return {
    question,
    answers,
    answersMeta: {
      limit: 100,
      total: answers.length,
    },
  };
};


// ============================================================
// SEMANTIC SEARCH QUESTIONS
// ============================================================

const cosineSimilarity = (vectorA, vectorB) => {
    if (
        !Array.isArray(vectorA) ||
        !Array.isArray(vectorB) ||
        vectorA.length !== vectorB.length
    ) {
        return -1;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];
        magnitudeA += vectorA[i] * vectorA[i];
        magnitudeB += vectorB[i] * vectorB[i];
    }

    if (magnitudeA === 0 || magnitudeB === 0) {
        return -1;
    }

    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
};

const rankVectorsAgainstQuery = (queryVector, vectors, { k }) => {
    return vectors
        .map((entry) => ({
            ...entry,
            score: cosineSimilarity(queryVector, entry.vector),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, k);
};

const backfillQuestionEmbeddings = async () => null;

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

    const questionIds = ranked.map((entry) => entry.questionId);
    const questions = questionIds.length
        ? await Question.findManyByIds(questionIds)
        : [];

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
    getQuestionsService,
    getSingleQuestionService,
    searchQuestionsSemanticService,
};