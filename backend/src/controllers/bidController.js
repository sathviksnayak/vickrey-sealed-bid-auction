import Bid from "../models/Bid.js";

export async function createBid(req, res) {
    try {

        const bid = await Bid.create(req.body);

        res.status(201).json(bid);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
}



export async function getMyBids(req, res) {
    try {

        const bids = await Bid.find({
            bidderWallet: req.params.wallet
        });

        res.status(200).json(bids);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
}

export async function updateBid(req, res) {
    try {

        const bid = await Bid.findOneAndUpdate(
            {
                auctionAddress: req.params.auctionAddress,
                bidderWallet: req.body.bidderWallet
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!bid) {
            return res.status(404).json({
                message: "Bid not found"
            });
        }

        res.status(200).json(bid);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
}