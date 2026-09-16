import Question from "../models/Question.js";
import Answer from "../models/Answer.js";

const createAnswerService = async ({ questionId, userId, content }) => {
 


  const question = await Question.findById(questionId);

  if (!question) {
   

    const error = new Error("Question not found.");

    
   
    error.statusCode = 404;

    

    throw error;
  }

  if (question.author.id === userId) {