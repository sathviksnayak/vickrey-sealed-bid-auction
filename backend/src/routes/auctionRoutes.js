import express from "express";

import {
    createAuction,
    getAuctions,
    getAuction,
    getMyAuctions,
    updateAuction
} from "../controllers/auctionController.js";

const router = express.Router();



router.post("/", createAuction);

router.get("/", getAuctions);

router.get("/my-auctions/:wallet", getMyAuctions);

router.get("/:address", getAuction);

router.put("/:address", updateAuction);

export default router;