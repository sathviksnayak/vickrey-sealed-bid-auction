import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { useWallet } from "../../context/WalletContext";
import BidCard from "../../components/bidcard/BidCard";

import AuctionABI from "../../abi/VickreyAuction.json";

import { getMyBids } from "../../services/bidService";
import { getAuction } from "../../services/auctionService";



export default function MyBids() {

    const { account,signer } = useWallet();

    const [auctions, setAuctions] = useState([]);
        const [loading, setLoading] = useState(false);



    useEffect(() => {

        if (!signer) return;

        async function loadAuctions() {
            setLoading(true);
            try {

                const auctions=await getMyBids(account);
                console.log(account);
                console.log(auctions);
                const auctionList = await Promise.all(

        auctions.map(async (auction) => {
          


        const contract = new ethers.Contract(
            auction.auctionAddress,
            AuctionABI,
            signer
        );

const [metadata, seller, commitDeadline, revealDeadline, penalty, finalized] =
    await Promise.all([
        getAuction(auction.auctionAddress),
        contract.seller(),
        contract.commitDeadline(),
        contract.revealDeadline(),
        contract.PENALTY_PERCENT(),
        contract.finalized(),
    ]);


        return {
            ...auction,
            ...metadata,
            seller,
            commitDeadline: Number(commitDeadline),
            revealDeadline: Number(revealDeadline),
            penalty: Number(penalty),
            finalized
        };
    })

);

setAuctions(auctionList);

            } catch (err) {
                console.error(err);
            }finally{
                setLoading(false);
            }

        }

        loadAuctions();

    }, [signer,account]);

    if (!signer) {
        return <h2>Connect your wallet.</h2>;
    }
    if (loading) {
    return <h2>Loading auctions...</h2>;
}
    if (auctions.length === 0) {
        return <h2>No bids found.</h2>;
    }

    return (
        <div>

            <h1>your Bids</h1>

            {auctions.map((auction) => (
                <BidCard
                 key={auction.auctionAddress}
                    auction={auction}
                />
            ))}

        </div>
    );
}