import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";


import {
    createAuction,
    getAuctions,
    getAuction,
    getMyAuctions,
    updateAuction
} from "../controllers/auctionController.js";

const router = express.Router();



router.post("/", authMiddleware,createAuction);

router.get("/", getAuctions);

router.get("/my-auctions/:wallet",authMiddleware, getMyAuctions);

router.get("/:address", getAuction);

router.put("/:address",authMiddleware, updateAuction);

export default router;