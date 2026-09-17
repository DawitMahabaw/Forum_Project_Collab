// Request optional AI feedback before submitting an answer.
import {
  ArrowLeft,
  Bold,
  CheckCircle2,
  Code2,
  Italic,
  Link2,
  MessageSquare,
  Pencil,
  Send,
  Share2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import MarkdownContent from "../../components/MarkdownContent/MarkdownContent.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  createAnswer,
  deleteAnswer,
  updateAnswer,
} from "../../services/answerService.js";
import {
  deleteQuestion,
  getAnswerFit,
  getQuestion,
  getSimilarQuestions,
  updateQuestion,
} from "../../services/questionService.js";
import styles from "./QuestionDetail.module.css";

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