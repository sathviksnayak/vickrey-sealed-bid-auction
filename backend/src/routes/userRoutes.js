import express from "express";

import {
    createUser,
    getUser,
    updateUser
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);

router.get("/:wallet", getUser);

router.put("/:wallet", updateUser);

export default router;