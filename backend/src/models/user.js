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
    }

},
{
    timestamps: true
}
);

export default mongoose.model("User", userSchema);