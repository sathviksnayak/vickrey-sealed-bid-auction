import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import ABI from "../../abi/VickreyAuction.json";
import { hashBid } from "../../utils/hashBid";
import { getAuction } from "../../services/auctionService";

export default  function Auction(){
const { address } = useParams();

const [auction, setAuction] = useState(null);
const [bidAmount, setBidAmount] = useState("");
const [salt, setSalt] = useState("");
const [contract, setContract] = useState(null);


    async function loadAuction() {
let auctionContract = contract;

if (!auctionContract) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    auctionContract = new ethers.Contract(
        address,
        ABI,
        signer
    );

    setContract(auctionContract);
}

        const metadata = await getAuction(address);

        const [
            seller,
            commitDeadline,
            revealDeadline,
            penalty,
            finalized,
            highestbid,
            secondhighestbid
        ] = await Promise.all([
            auctionContract.seller(),
            auctionContract.commitDeadline(),
            auctionContract.revealDeadline(),
            auctionContract.PENALTY_PERCENT(),
            auctionContract.finalized(),
            auctionContract.highestBid(),
            auctionContract.secondHighestBid()
        ]);

        setAuction({
            ...metadata,
            seller,
            commitDeadline: Number(commitDeadline),
            revealDeadline: Number(revealDeadline),
            penalty: Number(penalty),
            finalized,
            status: getStatus(
                Number(commitDeadline),
                Number(revealDeadline),
                finalized
            ),
            highestbid: Number(highestbid),
            secondhighestbid: Number(secondhighestbid)
        });
    }


useEffect(() => {
    loadAuction();

}, [address]);


function getStatus(commitDeadline, revealDeadline, finalized) {

    const now = Math.floor(Date.now() / 1000);

    if (finalized) return "Finalized";

    if (now < commitDeadline) return "Commit Phase";

    if (now < revealDeadline) return "Reveal Phase";

    return "Awaiting Finalization";
}   



//loop and update status
useEffect(() => {

    if (!auction) return;

    const interval = setInterval(() => {

        setAuction(prev => {

            if (!prev) return prev;

            return {
                ...prev,
                status: getStatus(
                    prev.commitDeadline,
                    prev.revealDeadline,
                    prev.finalized
                )
            };
        });

    }, 30000);

    return () => clearInterval(interval);

}, [    auction?.commitDeadline,
    auction?.revealDeadline,]);

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
await loadAuction();
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
        await loadAuction();

    } catch (err) {
        console.error(err);
        alert(err.shortMessage || err.reason || "Reveal failed");
    }
}

//finalise bid

async function handleFinalize() {
    try {
        const tx = await contract.finalizeAuction();

        await tx.wait();
     

        alert("Auction finalized successfully!");
        await loadAuction();

    } catch (err) {
        console.error(err);
        alert(err.shortMessage || err.reason || "Finalization failed");
    }
}

//withdrawrefunds

async function handleWithdraw() {
    try {
        const tx = await contract.withdrawRefund();

        await tx.wait();

        alert("Refund withdrawn successfully!");
        await loadAuction();

    } catch (err) {
        console.error(err);
        alert(err.shortMessage || err.reason || "Withdraw failed");
    }
}



    if(!auction) return <div> loading...</div>


    return <div><h1>Auction</h1>
<h2>{auction.title}</h2>

<p><strong>Category:</strong> {auction.category}</p>

<p><strong>Description:</strong> {auction.description}</p>

<p><strong>Address:</strong> {address}</p>

<p>
    <strong>Seller:</strong>{" "}
    {auction.seller.slice(0, 6)}...
    {auction.seller.slice(-4)}
</p>

<p>
    <strong>Commit Deadline:</strong>{" "}
    {new Date(auction.commitDeadline * 1000).toLocaleString()}
</p>

<p>
    <strong>Reveal Deadline:</strong>{" "}
    {new Date(auction.revealDeadline * 1000).toLocaleString()}
</p>

<p><strong>Penalty:</strong> {auction.penalty}%</p>

<p>
    <strong>Status:</strong> {auction.status}
</p>

    {auction.finalized && <div><p>highestbid:{auction.highestbid}</p>
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

       <button
        onClick={handleFinalize}
        disabled={!contract}>
        Finalize Auction
        </button>

        <button onClick={handleWithdraw} disabled={!contract}>withdraw funds</button>
    
    </div>
    
}


