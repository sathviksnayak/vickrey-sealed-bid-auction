import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    createUser,
    getUser,
    updateUser
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);

router.get("/:wallet", getUser);

router.put("/:wallet",authMiddleware, updateUser);

export default router;