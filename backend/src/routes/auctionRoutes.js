import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import {
    createAuction,
    getAuctions,
    getAuction,
    getMyAuctions,
 
} from "../controllers/auctionController.js";

const router = express.Router();



router.post(
    "/",
    authMiddleware,
    upload.fields([
        { name: "images", maxCount: 5 },
        { name: "documents", maxCount: 3 }
    ]),
    createAuction
);

router.get("/", getAuctions);

router.get("/my-auctions", authMiddleware, getMyAuctions);

router.get("/:address", getAuction);



export default router;