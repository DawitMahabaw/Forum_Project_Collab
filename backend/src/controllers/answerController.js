import {
  createAnswerService,
  deleteAnswerService,
  updateAnswerService,
} from "../services/answerService.js";

const validateCreateAnswerInput = ({ questionId, content }) => {
    
    if (questionId === undefined || questionId === null) {
    return "questionId is required.";
  }

   if (!Number.isInteger(Number(questionId))) {
    return "questionId must be an integer.";
  }