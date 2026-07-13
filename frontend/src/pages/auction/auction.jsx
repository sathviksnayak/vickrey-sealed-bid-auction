import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import ABI from "../../abi/VickreyAuction.json";
import { hashBid } from "../../utils/hashBid";


export default  function Auction(){
const { address } = useParams();

 const now = Math.floor(Date.now() / 1000);
const [auction, setAuction] = useState(null);
const [bidAmount, setBidAmount] = useState("");
const [salt, setSalt] = useState("");
const [contract, setContract] = useState(null);

    useEffect(() => {

        async function loadAuction() {

            const provider = new ethers.BrowserProvider(window.ethereum);

            const signer = await provider.getSigner();

            const contract = new ethers.Contract(
                address,
                ABI,
                signer
            );
            setContract(contract);

            const seller = await contract.seller();
            const commitDeadline = await contract.commitDeadline();
            const revealDeadline = await contract.revealDeadline();
            const penalty = await contract.PENALTY_PERCENT();
            const finalized = await contract.finalized();
            const highestbid=await contract.highestBid();
            const secondhighestbid=await contract.secondHighestBid();



            
            const status =
            finalized
            ? "Finalized"
            : now < commitDeadline
            ? "Commit Phase"
            : now < revealDeadline
            ? "Reveal Phase"
            : "Awaiting Finalization";


            setAuction({
            seller,
            commitDeadline: Number(commitDeadline),
            revealDeadline: Number(revealDeadline),
            penalty: Number(penalty),
            finalized,
            status,
            highestbid,
            secondhighestbid
            });
        }

        loadAuction();

    }, [address]);


    //commit bid
    async function handlecommit() {
    if (!bidAmount || !salt) {
    alert("Please enter both bid amount and secret.");
    return;
}
    const amount = ethers.parseEther(bidAmount);

    const bidHash = hashBid(amount, salt);
    try{

    const tx = await contract.commitBid(
    bidHash,
    {
        value: amount
    }
);

const receipt = await tx.wait();
alert("Bid committed successfully!");
console.log(receipt);


    }catch (err) {
    console.error(err);
    alert(err.shortMessage || err.reason || "Transaction failed");
}


}


//revealbid

async function handleReveal() {

        if (!bidAmount || !salt) {
    alert("Please enter both bid amount and secret.");
    return;
}
    try {
        const amount = ethers.parseEther(bidAmount);

        const saltBytes = ethers.encodeBytes32String(salt);

        const tx = await contract.revealBid(
            amount,
    saltBytes
        );

        await tx.wait();

        alert("Bid revealed successfully!");

    } catch (err) {
        console.error(err);
        alert(err.shortMessage || err.reason || "Reveal failed");
    }
}




    if(!auction) return <div> loading...</div>


    return <div><h1>Auction</h1>
    <h3>Address:{address}</h3>

    <p>seller:{auction.seller}</p>


    <p>commit deadline:{auction.commitDeadline}</p>

    <p>Reveal deadline:{auction.revealDeadline}</p>
    
    <p>Penalty:{auction.penalty} %</p>

    <p className="status">status:{auction.status}</p>

    {auction.finalized && <div><p>highestbid:{auction.highestBid}</p>
    <p>secondhighestbid:{auction.secondhighestbid}</p></div>}

   

        <input
            type="number"
            placeholder="Bid Amount (ETH)"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            />

                <input
                    type="text"
                    placeholder="Secret"
                    value={salt}
                    onChange={(e) => setSalt(e.target.value)}
                    />

<button onClick={handlecommit}  disabled={!contract} >Commit Bid</button>

        <button onClick={handleReveal} disabled={!contract}>reveal bid</button>

        <button>Finalise auction</button>

        <button>withdraw funds</button>
    
    </div>
    
}


