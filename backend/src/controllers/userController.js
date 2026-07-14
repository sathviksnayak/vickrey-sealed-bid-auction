import User from "../models/User.js";

export async function createUser(req, res) {
    try {
        const existingUser = await User.findOne({
            walletAddress: req.body.walletAddress
        });

        if (existingUser) {
            return res.status(200).json(existingUser);
        }

        const user = await User.create(req.body);

        res.status(201).json(user);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}

export async function getUser(req, res) {
    try {

        const user = await User.findOne({
            walletAddress: req.params.wallet
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}


export async function updateUser(req, res) {
    try {

        const user = await User.findOneAndUpdate(
            {
                walletAddress: req.params.wallet
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
}