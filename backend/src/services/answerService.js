import Question from "../models/Question.js";
import Answer from "../models/Answer.js";

const createAnswerService = async ({ questionId, userId, content }) => {
 


  const question = await Question.findById(questionId);

  if (!question) {
    
    // Create an Error object containing the message.
    const error = new Error("Question not found.");

    
    // 404 means "Not Found".
    error.statusCode = 404;

    // "throw" stops execution and sends the error back
    // through the application's error-handling flow.
    throw error;
  }