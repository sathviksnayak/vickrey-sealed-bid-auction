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
    const [reservePrice,setreservePrice]=useState("");

    const [images, setImages] = useState([]);
    const [documents, setDocuments] = useState([]);


    const [factory, setFactory] = useState(null);


    const [creating,setcreating]=useState(false);

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
            setcreating(true);

            const tx = await factory.createAuction(
                    Number(commitDuration),
                    Number(revealDuration),
                    Number(penalty),
                     ethers.parseEther(reservePrice)
                    );

            const receipt = await tx.wait();

             alert("Auction created successfully!");

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

            const formData = new FormData();

            formData.append("title", title);
            formData.append("description", description);
            formData.append("category", category);
            formData.append("commitDeadline", commitDeadline);
            formData.append("revealDeadline", revealDeadline);
            formData.append("penalty", penalty);
            formData.append("auctionAddress", newestAuction);
            
            images.forEach((image) => {
            formData.append("images", image);});

            documents.forEach((document) => {
            formData.append("documents", document);});

           await createAuction(formData);

            alert("Auction added successfully!");

           setTitle("");
            setDescription("");
            setCategory("");
            setCommitDuration("");
            setRevealDuration("");
            setPenalty("");
           setreservePrice("");

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || err.shortMessage || err.reason || "Transaction failed");
        }finally{
            setcreating(false);
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
            <label>ReservePrice:</label>
            <input type="number"
            min="0"
            onChange={(e)=>setreservePrice(e.target.value)}/>


                        <label>Images</label>
            <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files))}/>

            <label>Documents</label>
            <input
            type="file"
            multiple
            accept=".pdf"
            onChange={(e) => setDocuments(Array.from(e.target.files))}/>

            <hr/>
            <button
                onClick={handleCreateAuction}
                disabled={!factory || creating}
            >
                Create Auction
            </button>



        </div>
    );
}