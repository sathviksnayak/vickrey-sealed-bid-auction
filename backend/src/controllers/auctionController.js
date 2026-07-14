import Auction from "../models/Auction.js";

export async function createAuction(req, res) {
    try {

        const auction = await Auction.create(req.body);

        res.status(201).json(auction);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
}

export async function getAuctions(req, res) {

    try {

        const auctions = await Auction.find();

        res.status(200).json(auctions);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

}

export async function getAuction(req, res) {
    try {
        const auction = await Auction.findOne({
            auctionAddress: req.params.address
        });

        if (!auction) {
            return res.status(404).json({
                message: "Auction not found"
            });
        }

        res.status(200).json(auction);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

export async function getMyAuctions(req, res) {
    try {

        const auctions = await Auction.find({
            sellerWallet: req.params.wallet
        });

        res.status(200).json(auctions);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
}

export async function updateAuction(req, res) {
    try {

        const auction = await Auction.findOneAndUpdate(
            {
                auctionAddress: req.params.address
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!auction) {
            return res.status(404).json({
                message: "Auction not found"
            });
        }

        res.status(200).json(auction);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
}