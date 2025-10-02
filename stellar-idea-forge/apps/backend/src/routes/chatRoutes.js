import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { initChatSession, getUserSessions, endChatSession } from "../controllers/chatController.js";


const router = express.Router();

router.post('/init', authenticateToken, initChatSession);
router.get('/sessions', authenticateToken, getUserSessions);
router.post('/end/:sessionId', authenticateToken, endChatSession);

export default router;