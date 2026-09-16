import {
  createAnswerService,
  deleteAnswerService,
  updateAnswerService,
} from "../services/answerService.js";

const validateCreateAnswerInput = ({ questionId, content }) => {
    if (questionId === undefined || questionId === null) {
    return "questionId is required.";
  }