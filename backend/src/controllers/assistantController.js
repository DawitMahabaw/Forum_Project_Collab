import { queryAssistantService } from "../services/assistantService.js";

// ============================================================
// ASSISTANT CHAT CONTROLLER
// ============================================================
export const chatWithAssistant = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "A message string is required.",
      });
    }

    const userId = req.user?.userId || null;
    const userName = req.user?.firstName || null;

    const result = await queryAssistantService({
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      userId,
      userName,
    });

    return res.status(200).json({
      success: true,
      answer: result.answer,
      sources: result.sources || [],
      suggestedFollowUps: result.suggestedFollowUps || [],
    });
  } catch (error) {
    next(error);
  }
};
