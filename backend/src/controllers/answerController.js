import {
  createAnswerService,
  deleteAnswerService,
  updateAnswerService,
} from "../services/answerService.js";

const validateCreateAnswerInput = ({ questionId, content }) => {
    