import express from "express";
import { getChallenge, verifySignature } from "../controllers/authController.js";


const router = express.Router();

router.get("/challenge", getChallenge);
router.post("/verify", verifySignature);

export default router;