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


   if (!content || content.trim().length < 20) {
    return "content must contain at least 20 characters.";
  }
   return null;

  
}

const createAnswer = async (req, res, next) => {

    try{
    const { questionId, content } = req.body;
  

    const validationError = validateCreateAnswerInput({
      questionId,
      content,
    });