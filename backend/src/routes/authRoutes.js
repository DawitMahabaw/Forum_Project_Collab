import express from "express";
const router = express.Router();
import { login } from "../controllers/authController.js";


//  User Login Route
// POST /api/auth/login
router.post("/login", login); // The active task route path line

export default router;
