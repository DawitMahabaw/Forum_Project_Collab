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