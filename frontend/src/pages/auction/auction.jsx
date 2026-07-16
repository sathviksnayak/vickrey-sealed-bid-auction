import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import ABI from "../../abi/VickreyAuction.json";
import { hashBid } from "../../utils/hashBid";
import { getAuction } from "../../services/auctionService";
import { createBid,updateBid } from "../../services/bidService";
import { useWallet } from "../../context/WalletContext";

import { getAuctionChainData } from "../../services/blockchainService";


export default  function Auction(){
const { address } = useParams();

const {account }=useWallet();

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

    const [metadata, chainData] = await Promise.all([
        getAuction(address),
        getAuctionChainData(address, auctionContract.runner),
    ]);

    setAuction({
        ...metadata,
        ...chainData,
        status: getStatus(
            chainData.commitDeadline,
            chainData.revealDeadline,
            chainData.finalized
        ),
    });
}


useEffect(() => {
    loadAuction();

}, [address,contract]);


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

if (amount < auction.reservePrice) {
    alert("Bid must be at least the reserve price.");
    return;
}
  

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

  const now = new Date();

const data={auctionAddress:address,bidderWallet:account,revealed:false,committedAt:now,revealedAt:null}



 await createBid(data);
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
        const now = new Date();

const data = {
    bidderWallet: account,
    revealed: true,
    revealedAt: now
};

await updateBid(address, data);
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

<p>
    <strong>ReservePrice:</strong>{" "}
  {ethers.formatEther(auction.reservePrice)} ETH

</p>

<p><strong>Penalty:</strong> {auction.penalty}%</p>

<p>
    <strong>Status:</strong> {auction.status}
</p>

<h3>Images</h3>

<div>
    {auction.images?.map((image, index) => (
        <img
            key={index}
            src={image}
            alt={`Auction ${index + 1}`}
            width={250}
        />
    ))}
</div>


<h3>Documents</h3>

<ul>
    {auction.documents?.map((document, index) => (
        <li key={index}>
            <a
                href={document.url}
                target="_blank"
                rel="noreferrer"
            >
                {document.name}
            </a>
        </li>
    ))}
</ul>

    {auction.finalized && <div><p>Highest Bid: {ethers.formatEther(BigInt(auction.highestBid))} ETH</p>
<p>Second Highest Bid: {ethers.formatEther(BigInt(auction.secondHighestBid))} ETH</p></div>}

   

        <input
            type="number"
            placeholder="Bid Amount (ETH)"
           min={ethers.formatEther(auction.reservePrice)}
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


