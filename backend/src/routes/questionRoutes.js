import express from "express";
import {
    searchQuestionsSemantic
} from "../controllers/questionController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();