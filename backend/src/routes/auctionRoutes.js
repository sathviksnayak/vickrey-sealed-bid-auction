import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";


import {
    createAuction,
    getAuctions,
    getAuction,
    getMyAuctions,
 
} from "../controllers/auctionController.js";

const router = express.Router();



router.post("/", authMiddleware,createAuction);

router.get("/", getAuctions);

router.get("/my-auctions", authMiddleware, getMyAuctions);

router.get("/:address", getAuction);



export default router;