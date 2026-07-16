import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    createBid,
    getMyBids,
    updateBid
} from "../controllers/bidController.js";

const router = express.Router();

router.post("/",authMiddleware, createBid);

router.get("/my-bids", authMiddleware, getMyBids);

router.put("/:auctionAddress",authMiddleware, updateBid);

export default router;