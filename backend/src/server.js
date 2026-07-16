import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";
import auctionRoutes from "./routes/auctionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";

import authRoutes from "./routes/authRoutes.js";




const app = express();
;
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bids", bidRoutes);




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});