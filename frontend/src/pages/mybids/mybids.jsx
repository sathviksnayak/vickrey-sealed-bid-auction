import { useEffect, useState } from "react";
import "./mybids.css"

import { useWallet } from "../../context/WalletContext";
import BidCard from "../../components/bidcard/BidCard";

import { useAuthGuard } from "../../hooks/useAuthGuard";

import { getMyBids } from "../../services/bidService";
import { getAuction } from "../../services/auctionService";

import { getAuctionChainData } from "../../services/blockchainService";



export default function MyBids() {
    const auth=useAuthGuard();
    const { account,signer } = useWallet();

    const [auctions, setAuctions] = useState([]);
        const [loading, setLoading] = useState(false);



    useEffect(() => {

        if (!signer) return;

        async function loadAuctions() {
             if (!(await auth.ensureAuthenticated())) return;
            setLoading(true);

            try {

                const auctions=await getMyBids();

                const auctionList = await Promise.all(

        auctions.map(async (auction) => {
          
const [metadata, chainData] = await Promise.all([
    getAuction(auction.auctionAddress),
    getAuctionChainData(auction.auctionAddress, signer),
]);


        return {
            ...auction,
            ...metadata,
            ...chainData
            
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
        return <><h2>Connect your wallet.</h2>{auth.modal}</>;
    }
    if (loading) {
    return <><h2>Loading auctions...</h2>{auth.modal}</>;
}
    if (auctions.length === 0) {
        return <><h2>No bids found.</h2>{auth.modal}</>;
    }

    return (
        <div>
            <h1>Your Bids</h1>

            <div className="my-bids-list">
                {auctions.map((auction) => (
                    <BidCard
                        key={auction.auctionAddress}
                        auction={auction}
                        account={account}
                    />
                ))}
            </div>
            {auth.modal}
        </div>
    );
}