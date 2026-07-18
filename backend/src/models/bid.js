import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    auctionAddress: {
      type: String,
      required: true,
    },

    bidderWallet: {
      type: String,
      required: true,
    },

    revealed: {
      type: Boolean,
      default: false,
    },

    committedAt: Date,

    revealedAt: Date,
  },
  {
    timestamps: true,
  }
);
bidSchema.index({ auctionAddress: 1, bidderWallet: 1 }, { unique: true });

export default mongoose.model("Bid", bidSchema);
