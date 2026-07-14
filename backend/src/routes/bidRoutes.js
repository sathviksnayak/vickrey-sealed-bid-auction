import express from "express";

import {
    createBid,
    getMyBids,
    updateBid
} from "../controllers/bidController.js";

const router = express.Router();

router.post("/", createBid);

router.get("/my-bids/:wallet", getMyBids);

router.put("/:auctionAddress", updateBid);

export default router;