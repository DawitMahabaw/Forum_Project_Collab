import {
    createQuestionWithVectorService,
    getQuestionsService,
    getSingleQuestionService,
    searchQuestionsSemanticService,
    getSimilarQuestionsService,
    deleteQuestionService,
    updateQuestionService,
} from "../services/questionService.js";
import {
    generateQuestionDraftCoachService,
    assessAnswerAgainstQuestionService,
} from "../services/aiService.js";
import env from "../config/env.js";

// ------------------------------------------------------------
// HASH FORMAT VALIDATION
// ------------------------------------------------------------

const QUESTION_HASH_PATTERN = /^[a-f0-9]{16}$/;

const validateCreateQuestionInput = ({ title, content }) => {
    if (!title || !content) {
        return "Title and content are required.";
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (trimmedTitle.length < 5 || trimmedTitle.length > 255) {
        return "Title must be between 5 and 255 characters.";
    }

    if (trimmedContent.length < 10) {
        return "Content must contain at least 10 characters.";
    }

    return null;
};

// ============================================================
// CREATE QUESTION CONTROLLER
// ============================================================

const createQuestion = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const validationError = validateCreateQuestionInput({ title, content });
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        const question = await createQuestionWithVectorService({
            userId: req.user.userId,
            title: title.trim(),
            content: content.trim(),
        });

        return res.status(201).json({
            success: true,
            message: "Question posted successfully.",
            data: question,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// LIST QUESTIONS CONTROLLER
// ============================================================

const getQuestions = async (req, res, next) => {
    try {
        const { search, mine } = req.query;
        const onlyMine = mine === "true" || mine === "1";

        const { questions, meta } = await getQuestionsService({
            search: typeof search === "string" ? search.trim() : "",
            onlyMine,
            userId: req.user.userId,
        });

        return res.status(200).json({
            success: true,
            message: "Questions fetched successfully.",
            data: questions,
            meta,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// GET SINGLE QUESTION CONTROLLER
// ============================================================

const getSingleQuestion = async (req, res, next) => {
    try {
        const { questionHash } = req.params;

        if (!QUESTION_HASH_PATTERN.test(questionHash)) {
            return res.status(400).json({
                success: false,
                message: "Invalid question identifier.",
            });
        }

        const { question, answers, answersMeta } =
            await getSingleQuestionService(questionHash);

        return res.status(200).json({
            success: true,
            message: "Question fetched successfully",
            question,
            answers,
            answersMeta,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// SEMANTIC SEARCH VALIDATION
// ============================================================

const parseKParam = (rawK) => {
    if (rawK === undefined) {
        return { value: undefined, error: null };
    }

    if (
        !Number.isInteger(parsed) ||
        parsed < 1 ||
        parsed > env.semanticSearch.maxK
    ) {
        return {
            value: null,
            error: `k must be an integer between 1 and ${env.semanticSearch.maxK}.`,
        };
    }

    return { value: parsed, error: null };
};

const parseThresholdParam = (rawThreshold) => {
    if (rawThreshold === undefined) {
        return { value: undefined, error: null };
    }

    const parsed = Number(rawThreshold);

    if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) {
        return {
            value: null,
            error: "threshold must be a number between 0 and 1.",
        };
    }

    return { value: parsed, error: null };
};

// ============================================================
// SEMANTIC SEARCH CONTROLLER
// ============================================================

const searchQuestionsSemantic = async (req, res, next) => {
    try {
        const { query, k: rawK, threshold: rawThreshold } = req.query;

        if (typeof query !== "string" || query.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: "query must be at least 3 characters.",
            });
        }

        const { value: k, error: kError } = parseKParam(rawK);

        if (kError) {
            return res.status(400).json({ success: false, message: kError });
        }

        const { value: threshold, error: thresholdError } =
            parseThresholdParam(rawThreshold);

        if (thresholdError) {
            return res.status(400).json({ success: false, message: thresholdError });
        }

        const result = await searchQuestionsSemanticService({
            query: query.trim(),
            k,
            threshold,
        });

        return res.status(200).json({
            success: true,
            message: "Semantic search completed successfully",
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// SIMILAR QUESTIONS CONTROLLER
// ============================================================

const getSimilarQuestions = async (req, res, next) => {
    try {
        const { questionHash } = req.params;

        if (!QUESTION_HASH_PATTERN.test(questionHash)) {
            return res.status(400).json({
                success: false,
                message: "Invalid question identifier.",
            });
        }

        const { k: rawK, threshold: rawThreshold } = req.query;

        const { value: k, error: kError } = parseKParam(rawK);

        if (kError) {
            return res.status(400).json({ success: false, message: kError });
        }

        const { value: threshold, error: thresholdError } =
            parseThresholdParam(rawThreshold);

        if (thresholdError) {
            return res.status(400).json({ success: false, message: thresholdError });
        }

        const result = await getSimilarQuestionsService({
            questionHash,
            k,
            threshold,
        });

        return res.status(200).json({
            success: true,
            message: "Similar questions fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// DRAFT COACH CONTROLLER
// ============================================================

const generateQuestionDraftCoach = async (req, res, next) => {
    try {
        const { title, content } = req.body;

        const normalizedTitle = typeof title === "string" ? title.trim() : "";

        const normalizedContent = typeof content === "string" ? content.trim() : "";

        if (!normalizedTitle && !normalizedContent) {
            return res.status(400).json({
                success: false,
                message: "Write a title or some details before requesting suggestions.",
            });
        }

        const data = await generateQuestionDraftCoachService({
            title: normalizedTitle,
            content: normalizedContent,
        });

        return res.status(200).json({
            success: true,
            message: "Draft suggestions generated",
            data,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// ANSWER FIT CONTROLLER
// ============================================================

const assessAnswerAgainstQuestion = async (req, res, next) => {
    try {
        const { questionHash } = req.params;

        const { answerText } = req.body;

        if (!QUESTION_HASH_PATTERN.test(questionHash)) {
            return res.status(400).json({
                success: false,
                message: "Invalid question identifier.",
            });
        }

        if (typeof answerText !== "string" || answerText.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: "answerText must contain at least 20 characters.",
            });
        }

        const { question } = await getSingleQuestionService(questionHash);

        const data = await assessAnswerAgainstQuestionService({
            question,
            answerText: answerText.trim(),
        });

        return res.status(200).json({
            success: true,
            message: "Answer fit assessed",
            data,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// UPDATE QUESTION VALIDATION
// ============================================================

const validateQuestionUpdate = ({ title, content }) => {
    if (typeof title !== "string" || typeof content !== "string") {
        return "Title and content are required.";
    }

    if (title.trim().length < 5 || title.trim().length > 255) {
        return "Title must be between 5 and 255 characters.";
    }

    if (content.trim().length < 10) {
        return "Content must contain at least 10 characters.";
    }

    return null;
};

// ============================================================
// UPDATE QUESTION CONTROLLER
// ============================================================

const updateQuestion = async (req, res, next) => {
    try {
        const { questionHash } = req.params;

        const validationError = validateQuestionUpdate(req.body);

        if (!QUESTION_HASH_PATTERN.test(questionHash)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid question identifier." });
        }

        if (validationError) {
            return res.status(400).json({ success: false, message: validationError });
        }

        const question = await updateQuestionService({
            questionHash,
            userId: req.user.userId,

            title: req.body.title.trim(),
            content: req.body.content.trim(),
        });

        return res.status(200).json({
            success: true,
            message: "Question updated successfully.",
            data: question,
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// DELETE QUESTION CONTROLLER
// ===========================================================

const deleteQuestion = async (req, res, next) => {
    try {
        const { questionHash } = req.params;

        if (!QUESTION_HASH_PATTERN.test(questionHash)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid question identifier." });
        }

        await deleteQuestionService({
            questionHash,
            userId: req.user.userId,
        });

        return res
            .status(200)
            .json({ success: true, message: "Question deleted successfully." });
    } catch (error) {
        next(error);
    }
};