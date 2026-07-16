// services/blockchainService.js

import { ethers } from "ethers";
import AuctionABI from "../abi/VickreyAuction.json";

export async function getAuctionChainData(address, signer) {
    const contract = new ethers.Contract(address, AuctionABI, signer);

    const [
        seller,
        commitDeadline,
        revealDeadline,
        penalty,
        finalized,
        reservePrice,
        highestBidder,
        highestBid,
        secondHighestBid,
    ] = await Promise.all([
        contract.seller(),
        contract.commitDeadline(),
        contract.revealDeadline(),
        contract.PENALTY_PERCENT(),
        contract.finalized(),
        contract.reservePrice(),
        contract.highestBidder(),
        contract.highestBid(),
        contract.secondHighestBid(),
    ]);

    return {
        seller,
        commitDeadline: Number(commitDeadline),
        revealDeadline: Number(revealDeadline),
        penalty: Number(penalty),
        finalized,
        reservePrice,
        highestBidder,
        highestBid,
        secondHighestBid,
    };
}