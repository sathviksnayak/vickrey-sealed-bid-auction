import crypto from "crypto";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";

export async function getNonce(req, res, next) {
  try {
    const { wallet } = req.body;

    const nonce = crypto.randomBytes(32).toString("hex");

    const user = await User.findOneAndUpdate(
      { walletAddress: wallet },
      { nonce },
      { new: true }
    );

    res.status(200).json({ nonce });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { wallet, signature } = req.body;

    const user = await User.findOne({
      walletAddress: wallet,
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const nonce = user.nonce;

    const message = `Welcome to Vickrey Auction Nonce: ${nonce}`;

    const recovered = ethers.verifyMessage(message, signature);
    if (ethers.getAddress(recovered) === ethers.getAddress(wallet)) {
      const token = jwt.sign({ wallet }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      user.nonce = crypto.randomBytes(32).toString("hex");
      await user.save();

      res.status(200).json({ token });
    } else {
      return res.status(401).json({ message: "Invalid signature" });
    }
  } catch (err) {
    next(err);
  }
}

export function getCurrentUser(req, res) {
  res.json({
    authenticated: true,
    user: req.user,
  });
}
