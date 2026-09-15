import {
    getQuestionsService,
    searchQuestionsSemanticService
} from "../services/questionService.js";
import env from "../config/env.js";

// ============================================================
// SEMANTIC SEARCH VALIDATION
// ============================================================

const parseKParam = (rawK) => {
    if (rawK === undefined) {
        return { value: undefined, error: null };
    }

    const parsed = Number(rawK);

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
// GET QUESTIONS CONTROLLER (T-10)
// ============================================================

const getQuestions = async (req, res, next) => {
    try {
        const { search, mine } = req.query;
        const onlyMine = mine === "true" || mine === "1";

        const { questions, meta } = await getQuestionsService({
            search: typeof search === "string" ? search.trim() : "",
            onlyMine,
            userId: req.user?.userId,
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
// EXPORT CONTROLLERS
// ============================================================

export {
    getQuestions,
    searchQuestionsSemantic,
};