import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
{
    auctionAddress: {
        type: String,
        required: true
    },

    bidderWallet: {
        type: String,
        required: true
    },



    revealed: {
        type: Boolean,
        default: false
    },

    committedAt: Date,

    revealedAt: Date
},
{
    timestamps: true
}
);

export default mongoose.model("Bid", bidSchema);