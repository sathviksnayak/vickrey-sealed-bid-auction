import crypto from "crypto";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";

export async function getNonce(req, res, next) {
  try {
    const { wallet } = req.body;

    if (!wallet) {
      return res.status(400).json({ message: "Wallet is required" });
    }

    const nonce = crypto.randomBytes(32).toString("hex");
    const nonceExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await User.findOneAndUpdate(
      { walletAddress: wallet },
      { nonce, nonceExpiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ nonce });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { wallet, signature } = req.body;

    if (!wallet || !signature) {
      return res.status(400).json({ message: "Wallet and signature are required" });
    }

    let user = await User.findOne({
      walletAddress: wallet,
    });

    if (!user) {
      user = await User.create({ walletAddress: wallet });
    }

    const nonce = user.nonce;

    if (!nonce) {
      return res.status(401).json({ message: "Missing nonce" });
    }

    const nonceExpiresAt = user.nonceExpiresAt ? new Date(user.nonceExpiresAt) : null;

    if (!nonceExpiresAt || nonceExpiresAt.getTime() <= Date.now()) {
      user.nonce = null;
      user.nonceExpiresAt = null;
      await user.save();

      return res.status(401).json({ message: "Nonce expired" });
    }

    const message = `Welcome to Vickrey Auction Nonce: ${nonce}`;

    const recovered = ethers.verifyMessage(message, signature);
    if (ethers.getAddress(recovered) === ethers.getAddress(wallet)) {
      const token = jwt.sign({ wallet }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      user.nonce = null;
      user.nonceExpiresAt = null;
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
