// Authentication is required before evaluating an answer.
router.post(
  "/:questionHash/answer-fit",
  authenticate,
  assessAnswerAgainstQuestion,
);
