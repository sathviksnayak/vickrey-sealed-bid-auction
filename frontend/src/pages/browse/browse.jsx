import { useEffect, useState } from "react";
import { useWallet } from "../../context/WalletContext";
import AuctionCard from "../../components/auctioncard/AuctionCard";

import { CONTRACT_ADDRESS } from "../../utils/constants";
export default function Browse() {

    const { contract } = useWallet();

    const [auction, setAuction] = useState(null);

    useEffect(() => {

        if (!contract) return;

        async function loadAuction() {
            try {

                const seller = await contract.seller();
                const commitDeadline = await contract.commitDeadline();
                const revealDeadline = await contract.revealDeadline();
                const penalty = await contract.PENALTY_PERCENT();
                const finalized = await contract.finalized();

                setAuction({
                    address:CONTRACT_ADDRESS,
                    seller,
                    commitDeadline: Number(commitDeadline),
                    revealDeadline: Number(revealDeadline),
                    penalty: Number(penalty),
                    finalized
                });

            } catch (err) {
                console.error(err);
            }
        }

        loadAuction();

    }, [contract]);

    if (!contract) {
        return <h2>Connect your wallet.</h2>;
    }

    if (!auction) {
        return <h2>Loading auction...</h2>;
    }

    return (
        <div>
            <h1>Browse auctions</h1>

        <AuctionCard auction={auction} />

        </div>
    );
}