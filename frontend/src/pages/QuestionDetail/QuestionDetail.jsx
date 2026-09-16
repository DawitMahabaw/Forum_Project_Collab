// Request optional AI feedback before submitting an answer.
const handleCheckFit = async () => {
  if (answerText.trim().length < 20) {
    setAnswerError("Write at least 20 characters before checking answer fit.");
    return;
  }
  setAnswerError("");
  setIsCheckingFit(true);

  try {
    setFit(await getAnswerFit(questionHash, answerText.trim()));
  } catch (requestError) {
    setAnswerError(
      requestError.response?.data?.message ||
        "Could not check answer fit right now.",
    );
  } finally {
    setIsCheckingFit(false);
  }

};



{
  fit && (
    <div className={`${styles.fitPanel} ${styles[`fit${fit.level}`]}`}>
      <b>{fit.level} fit</b>
      <p>{fit.note}</p>
    </div>
  );
}