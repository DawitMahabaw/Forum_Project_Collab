import { createQuestionService } from "../services/createQuestionService.js";

const createQuestion = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question title is required.",
      });
    }

    if (typeof description !== "string" || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question description is required.",
      });
    }

    const userId = req.user.userId;

    const question = await createQuestionService({
      title: title.trim(),
      content: description.trim(),
      userId,
    });

    return res.status(201).json({
      success: true,
      message: "Question created successfully.",
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

export { createQuestion };
