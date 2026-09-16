import express from "express";


import {
  createAnswer,
  deleteAnswer,
  updateAnswer,
} from "../controllers/answerController.js";

import authenticate from "../middleware/authMiddleware.js";