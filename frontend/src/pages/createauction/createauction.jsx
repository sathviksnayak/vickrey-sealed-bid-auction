import { useState, useEffect } from "react";
import { ethers } from "ethers";

import { useWallet } from "../../context/WalletContext";

import FactoryABI from "../../abi/AuctionFactory.json";

import { FACTORY_ADDRESS } from "../../utils/constants";

export default function CreateAuction() {

    const { signer } = useWallet();

    const [commitDuration, setCommitDuration] = useState("");
    const [revealDuration, setRevealDuration] = useState("");
    const [penalty, setPenalty] = useState("");

    const [factory, setFactory] = useState(null);

    useEffect(() => {

        if (!signer) return;

        async function loadFactory() {

            const contract = new ethers.Contract(
                FACTORY_ADDRESS,
                FactoryABI,
                signer
            );

            setFactory(contract);
        }

        loadFactory();

    }, [signer]);

    async function handleCreateAuction() {

        if (
            commitDuration === "" ||
            revealDuration === "" ||
            penalty === ""
        ) {
            alert("Please fill all fields.");
            return;
        }

        try {

            const tx = await factory.createAuction(
                Number(commitDuration),
                Number(revealDuration),
                Number(penalty)
            );

            await tx.wait();

            const auctions = await factory.getAuctions();
            const newestAuction = auctions[auctions.length - 1];

            alert("Auction created successfully!");

            console.log("Auction Address:", newestAuction);

        } catch (err) {
            console.error(err);
            alert(err.shortMessage || err.reason || "Transaction failed");
        }
    }

    return (
        <div>

            <h1>Create Auction</h1>

            <label>Commit Duration (minutes)</label>
            <input
                type="number"
                onChange={(e) =>
                    setCommitDuration(Number(e.target.value) * 60)
                }
            />

            <label>Reveal Duration (minutes)</label>
            <input
                type="number"
                onChange={(e) =>
                    setRevealDuration(Number(e.target.value) * 60)
                }
            />

            <label>Penalty Percentage</label>
            <input
                type="number"
                onChange={(e) =>
                    setPenalty(Number(e.target.value))
                }
            />

            <button
                onClick={handleCreateAuction}
                disabled={!factory}
            >
                Create Auction
            </button>

        </div>
    );
}