import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { useWallet } from "../../context/WalletContext";
import AuctionCard from "../../components/auctioncard/AuctionCard";

import AuctionABI from "../../abi/VickreyAuction.json";




import { getAuctions } from "../../services/auctionService";

export default function Browse() {

    const { signer } = useWallet();

    const [auctions, setAuctions] = useState([]);




    useEffect(() => {

        if (!signer) return;

        async function loadAuctions() {

            try {

                const auctions=await getAuctions();
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
    finalized
] = await Promise.all([
    contract.seller(),
    contract.commitDeadline(),
    contract.revealDeadline(),
    contract.PENALTY_PERCENT(),
    contract.finalized()
]);


        return {
            ...auction,
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
            }

        }

        loadAuctions();

    }, [signer]);

    if (!signer) {
        return <h2>Connect your wallet.</h2>;
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