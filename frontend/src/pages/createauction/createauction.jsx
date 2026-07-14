import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { createAuction } from "../../services/auctionService";

import { useWallet } from "../../context/WalletContext";

import FactoryABI from "../../abi/AuctionFactory.json";
import { FACTORY_ADDRESS } from "../../utils/constants";

export default function CreateAuction() {

    const { signer, account } = useWallet();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");

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
            !title.trim() ||
            !description.trim() ||
            !category.trim() ||
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

            const receipt = await tx.wait();

            const event = receipt.logs.map(log => {
            try {
            return factory.interface.parseLog(log);
            } catch {
            return null;
            }}).find(log => log && log.name === "AuctionCreated");

            const newestAuction = event.args.auction;

            const now = Math.floor(Date.now() / 1000);

            const commitDeadline = now + Number(commitDuration);
            const revealDeadline =
                commitDeadline + Number(revealDuration);

           await createAuction({
            auctionAddress: newestAuction,
            sellerWallet: account,

            title,
            description,
            category,

            images: [],

            commitDeadline,
            revealDeadline,
            penalty
        });

            alert("Auction created successfully!");

           setTitle("");
            setDescription("");
            setCategory("");
            setCommitDuration("");
            setRevealDuration("");
            setPenalty("");

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.shortMessage || err.reason || "Transaction failed");
        }
    }

    return (
        <div>

            <h1>Create Auction</h1>

            <label>Title</label>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <label>Description</label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <label>Category</label>
           <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Furniture">Furniture</option>
            <option value="Books">Books</option>
            <option value="Collectibles">Collectibles</option>
            <option value="Other">Other</option>
            </select>

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
                min="0"
                max="100"
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