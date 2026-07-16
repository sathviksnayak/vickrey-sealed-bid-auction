import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
{
    auctionAddress: {
        type: String,
        required: true,
        unique: true
    },

    sellerWallet: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    category: {
        type: String
    },

  images: [
    {
        type: String
    }
],

documents: [
    {
        name: {
            type: String
        },
        url: {
            type: String
        }
    }
],

    commitDeadline: Number,

    revealDeadline: Number,

    penalty: Number
},
{
    timestamps: true
}
);

export default mongoose.model("Auction", auctionSchema);