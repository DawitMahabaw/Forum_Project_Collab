import { getQuestionsService } from "../services/questionService.js";

// GET /api/questions?search=...&mine=true
const getQuestions = async (req, res, next) => {
  try {
    const { search, mine } = req.query;
    const onlyMine = mine === "true" || mine === "1";

    const { questions, meta } = await getQuestionsService({
      search: typeof search === "string" ? search.trim() : "",
      onlyMine,
      userId: req.user?.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Questions fetched successfully.",
      data: questions,
      meta,
    });
  } catch (error) {
    next(error);
  }
};

export { getQuestions };