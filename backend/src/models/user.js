import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
    walletAddress: {
        type: String,
        required: true,
        unique: true
    },

    username: {
        type: String
    },

    avatar: {
        type: String
    },

    bio: {
        type: String
    },
        nonce: {
        type: String,
        default: null,
    }

},
{
    timestamps: true
},

);

export default mongoose.model("User", userSchema);