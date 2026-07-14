import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { useWallet } from "../../context/WalletContext";
import AuctionCard from "../../components/auctioncard/AuctionCard";

import AuctionABI from "../../abi/VickreyAuction.json";
import FactoryABI from "../../abi/AuctionFactory.json";

import { FACTORY_ADDRESS } from "../../utils/constants";

export default function Browse() {

    const { signer } = useWallet();

    const [auctions, setAuctions] = useState([]);

    useEffect(() => {

        if (!signer) return;

        async function loadAuctions() {

            try {

                const factory = new ethers.Contract(
                    FACTORY_ADDRESS,
                    FactoryABI,
                    signer
                );

                const addresses = await factory.getAuctions();

                const auctionList = [];

                for (const address of addresses) {

                    const contract = new ethers.Contract(
                        address,
                        AuctionABI,
                        signer
                    );

                    const seller = await contract.seller();
                    const commitDeadline = await contract.commitDeadline();
                    const revealDeadline = await contract.revealDeadline();
                    const penalty = await contract.PENALTY_PERCENT();
                    const finalized = await contract.finalized();

                    auctionList.push({
                        address,
                        seller,
                        commitDeadline: Number(commitDeadline),
                        revealDeadline: Number(revealDeadline),
                        penalty: Number(penalty),
                        finalized,
                    });
                }

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
                    key={auction.address}
                    auction={auction}
                />
            ))}

        </div>
    );
}