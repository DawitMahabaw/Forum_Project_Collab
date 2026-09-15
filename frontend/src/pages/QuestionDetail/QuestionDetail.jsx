// Request optional AI feedback before submitting an answer.
const handleCheckFit = async () => {
  if (answerText.trim().length < 20) {
    setAnswerError("Write at least 20 characters before checking answer fit.");
    return;
  }


};
