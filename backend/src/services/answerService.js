import Question from "../models/Question.js";
import Answer from "../models/Answer.js";

const createAnswerService = async ({ questionId, userId, content }) => {
 


  const question = await Question.findById(questionId);