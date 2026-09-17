import Question from "../models/Question.js";
import QuestionVector from "../models/QuestionVector.js";
import Answer from "../models/Answer.js";

import { generateHash } from "../utils/hash.js";
import { embedContent } from "../ai/gemini.js";
import { cosineSimilarity } from "../ai/vectorMath.js";
import { generateJson } from "../ai/generateText.js";

import env from "../config/env.js";

const buildEmbeddingText = ({ title, content }) =>
    `Question title: ${title}\n\nQuestion details: ${content}`.slice(0, 12000);

// ============================================================
// CREATE QUESTION & AUTO-EMBED
// ============================================================
const createQuestionWithVectorService = async ({ userId, title, content }) => {

    let questionHash = generateHash();
    let existing = await Question.findByHash(questionHash);

    while (existing) {
        questionHash = generateHash();
        existing = await Question.findByHash(questionHash);
    }

    const created = await Question.create({
        questionHash,
        userId,
        title,
        content,
    });

    const { success, embedding } = await embedContent(
        buildEmbeddingText({ title, content }),
        "RETRIEVAL_DOCUMENT",
    );

    await QuestionVector.upsert({
        questionId: created.id,
        embedding: success ? embedding : null,
        status: success ? "ready" : "failed",
    });

    return {
        id: created.id,
        questionHash: created.questionHash,
        title: created.title,
        content: created.content,
        userId: created.userId,
    };
};

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

const updateQuestionService = async ({
    questionHash,
    userId,
    title,
    content,
}) => {
    const question = await Question.findByHash(questionHash);

    if (!question) {
        const error = new Error("Question not found.");
        error.statusCode = 404;
        throw error;
    }

    if (Number(question.author.id) !== Number(userId)) {
        const error = new Error("You can only edit your own question.");
        error.statusCode = 403;
        throw error;
    }

    const updatedQuestion = await Question.updateOwnedByHash(questionHash, userId, {
        title,
        content,
    });

    try {
        const embeddingResult = await embedContent(
            buildEmbeddingText({ title, content }),
            "RETRIEVAL_DOCUMENT",
        );

        await QuestionVector.upsert({
            questionId: updatedQuestion.id,
            embedding: embeddingResult.success ? embeddingResult.embedding : null,
            status: embeddingResult.success ? "ready" : "failed",
        });
    } catch (embeddingError) {
        console.warn("Question embedding refresh failed:", embeddingError.message);
    }

    return updatedQuestion;
};

const deleteQuestionService = async ({ questionHash, userId }) => {
    const question = await Question.findByHash(questionHash);

    if (!question) {
        const error = new Error("Question not found.");
        error.statusCode = 404;
        throw error;
    }

    if (Number(question.author.id) !== Number(userId)) {
        const error = new Error("You can only delete your own question.");
        error.statusCode = 403;
        throw error;
    }

    await Question.deleteOwnedByHash(questionHash, userId);
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

// ============================================================
// FIND SIMILAR QUESTIONS
// ============================================================

const getSimilarQuestionsService = async ({ questionHash, k, threshold }) => {
    const resolvedK = k || env.semanticSearch.defaultK;
    const resolvedThreshold =
        threshold === undefined || threshold === null
            ? env.semanticSearch.recommendThreshold
            : threshold;

    const sourceQuestion = await Question.findByHash(questionHash);

    if (!sourceQuestion) {
        const error = new Error("Question not found.");
        error.statusCode = 404;
        throw error;
    }

    const sourceVector = await QuestionVector.findByQuestionId(sourceQuestion.id);

    if (!sourceVector || sourceVector.status !== "ready") {
        // The source question has no usable embedding (embedding
        // failed when it was created). There is nothing to compare
        // against, so we return an empty result instead of an error -
        // the page should simply show "no similar questions found".
        return {
            data: [],
            meta: {
                total: 0,
                k: resolvedK,
                threshold: resolvedThreshold,
                query: null,
                questionHash,
            },
        };
    }

    const vectors = await QuestionVector.findAllReady({
        excludeQuestionId: sourceQuestion.id,
    });

    const ranked = rankVectorsAgainstQuery(sourceVector.embedding, vectors, {
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
            query: null,
            questionHash,
        },
    };
};

// ============================================================
// AI DRAFT COACH (T-17)
// ============================================================

const draftCoach = async ({ title, body }) => {
    // ------------------------------------------------------------
    // We build one clear prompt that:
    //
    // 1. Explains the AI's role.
    // 2. Gives it the draft title/body.
    // 3. Describes EXACTLY what JSON shape to return.
    //
    // Being explicit about the JSON shape is what lets us safely
    // read response.tips as an array on the other end.
    // ------------------------------------------------------------

    const prompt = `
You are a writing coach for a technical Q&A forum, similar to Stack Overflow.

A user is DRAFTING a question (not yet posted). Give short, practical
feedback that helps other developers understand and answer it.

Draft title: ${title || "(empty)"}
Draft body: ${body || "(empty)"}

Respond with ONLY valid JSON in this exact shape:
{
  "tips": ["short tip 1", "short tip 2", "short tip 3"],
  "overallQuality": "needs_work" | "good" | "excellent"
}

Rules:
- Give at most 4 tips.
- Each tip must be one short sentence.
- Focus on missing context, vague wording, or missing error details/code.
- If the draft is already clear and detailed, say so honestly instead of
  inventing problems.
`;

    const result = await generateJson(prompt);

    return result;
};

export {
    getQuestionsService,
    getSingleQuestionService,
    searchQuestionsSemanticService,
};