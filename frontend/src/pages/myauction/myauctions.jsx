import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { useWallet } from "../../context/WalletContext";
import AuctionCard from "../../components/auctioncard/AuctionCard";

import AuctionABI from "../../abi/VickreyAuction.json";




import { getMyAuctions } from "../../services/auctionService";

export default function MyAuctions() {

    const { account,signer } = useWallet();

    const [auctions, setAuctions] = useState([]);
        const [loading, setLoading] = useState(false);



    useEffect(() => {

        if (!signer) return;

        async function loadAuctions() {
            setLoading(true);
            try {

                const auctions=await getMyAuctions();
                console.log(account);

                const auctionList = await Promise.all(

        auctions.map(async (auction) => {

        const contract = new ethers.Contract(
            auction.auctionAddress,
            AuctionABI,
            signer
        );

const [
    seller,
    commitDeadline,
    revealDeadline,
    penalty,
    finalized,
    reservePrice
] = await Promise.all([
    contract.seller(),
    contract.commitDeadline(),
    contract.revealDeadline(),
    contract.PENALTY_PERCENT(),
    contract.finalized(),
    contract.reservePrice()
]);


        return {
            ...auction,
            seller,
            commitDeadline: Number(commitDeadline),
            revealDeadline: Number(revealDeadline),
            penalty: Number(penalty),
            finalized,
            reservePrice
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
        return <h2>No auctions found.</h2>;
    }

    return (
        <div>

            <h1>your Auctions</h1>

            {auctions.map((auction) => (
                <AuctionCard
                 key={auction.auctionAddress}
                    auction={auction}
                />
            ))}

        </div>
    );
}