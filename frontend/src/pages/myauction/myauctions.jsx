import { useEffect, useState } from "react";


import { useWallet } from "../../context/WalletContext";
import MyAuctionCard from "../../components/myauctioncard/myauctioncard";

import { useAuthGuard } from "../../hooks/useAuthGuard";

import { getAuctionChainData } from "../../services/blockchainService";


import { getMyAuctions } from "../../services/auctionService";

import "./myauctions.css"

export default function MyAuctions() {
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

                const auctions=await getMyAuctions();
                console.log(account);

                const auctionList = await Promise.all(

        auctions.map(async (auction) => {

       const chainData = await getAuctionChainData(
    auction.auctionAddress,
    signer
);

        return {
            ...auction,
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
        return <><h2>No auctions found.</h2>{auth.modal}</>;
    }

    return (
        <div>
            <h1>Your Auctions</h1>

            <div className="my-auctions-list">
                {auctions.map((auction) => (
                    <MyAuctionCard
                        key={auction.auctionAddress}
                        auction={auction}
                    />
                ))}
            </div>
            {auth.modal}
        </div>
    );
}