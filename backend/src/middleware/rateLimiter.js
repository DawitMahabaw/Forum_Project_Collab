// internally keeps track of requests
// handles the counting and timing

import rateLimit from "express-rate-limit";

//Rate limiting protects API usage
// to avoid too many requests
const draftCoachLimiter = rateLimit({
  windowMs: 60 * 1000,
// maximum 10 requests per minute
  max: 10, 

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many AI requests. Please try again later.",
  },
});

export { draftCoachLimiter };