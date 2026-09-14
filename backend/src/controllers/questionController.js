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

