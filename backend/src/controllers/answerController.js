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

     if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }


     const answer = await createAnswerService({
      questionId: Number(questionId),
      userId: req.user.userId,
      content: content.trim(),
    });


     return res.status(201).json({
      success: true,
      message: "Answer posted successfully",
      data: answer,
    });


     } catch (error) {
    next(error);
  }
};


const getAnswerId = (value) => {

    const answerId = Number(value);

    if (!Number.isSafeInteger(answerId) || answerId < 1) {
    const error = new Error("Answer identifier must be a positive integer.");
    error.statusCode = 400;
    throw error;
  }

   return answerId;

  
};

const updateAnswer = async (req, res, next) => {

    try {
    const content = req.body.content;

     if (typeof content !== "string" || content.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: "content must contain at least 20 characters.",
      });
    }

     const answer = await updateAnswerService({
      answerId: getAnswerId(req.params.answerId),
      userId: req.user.userId,
      content: content.trim(),
    });


    
    return res.status(200).json({
      success: true,
      message: "Answer updated successfully.",
      data: answer,
    });

    } catch (error) {
    next(error);
  }

 
};