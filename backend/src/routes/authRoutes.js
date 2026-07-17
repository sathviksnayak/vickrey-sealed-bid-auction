import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";

import {
    getNonce,
    login,getCurrentUser
} from "../controllers/authController.js";

const router = express.Router();

router.post("/nonce", getNonce);

router.post("/login", login);

router.get("/me",authMiddleware,getCurrentUser)

export default router;