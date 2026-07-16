import { useEffect, useState } from "react";


import { useWallet } from "../../context/WalletContext";
import AuctionCard from "../../components/auctioncard/AuctionCard";



import { getAuctionChainData } from "../../services/blockchainService";


import { getAuctions } from "../../services/auctionService";

export default function Browse() {

    const { provider } = useWallet();

    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(false);




    useEffect(() => {

        if (!provider) return;

        async function loadAuctions() {

            try {
                setLoading(true);

                const auctions=await getAuctions();
 const auctionList = await Promise.all(

    auctions.map(async (auction) => {

const chainData = await getAuctionChainData(
    auction.auctionAddress,
    provider
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
            } finally {
        setLoading(false);
    }

        }

        loadAuctions();

    }, [provider]);

if (loading) {
    return <h2>Loading auctions...</h2>;
}

if (auctions.length === 0) {
    return <h2>No auctions found.</h2>;
}

    return (
        <div>

            <h1>Browse Auctions</h1>

            {auctions.map((auction) => (
                <AuctionCard
                 key={auction.auctionAddress}
                    auction={auction}
                />
            ))}

        </div>
    );
}