import Bid from "../models/bid.js";

export async function createBid(req, res, next) {
  try {
    const bid = await Bid.create({
      ...req.body,
      bidderWallet: req.user.wallet,
    });

    res.status(201).json(bid);
  } catch (err) {
    next(err);
  }
}

export async function getMyBids(req, res, next) {
  try {
    const bids = await Bid.find({
      bidderWallet: req.user.wallet,
    });

    res.status(200).json(bids);
  } catch (err) {
    next(err);
  }
}

export async function updateBid(req, res, next) {
  try {
    const bid = await Bid.findOneAndUpdate(
      {
        auctionAddress: req.params.auctionAddress,
        bidderWallet: req.user.wallet,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bid) {
      return res.status(404).json({
        message: "Bid not found",
      });
    }

    res.status(200).json(bid);
  } catch (err) {
    next(err);
  }
}
