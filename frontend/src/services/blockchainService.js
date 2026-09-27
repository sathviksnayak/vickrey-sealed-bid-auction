// services/blockchainService.js

import { ethers } from "ethers";
import AuctionABI from "../abi/VickreyAuction.json";

const PUBLIC_SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

export function getPublicProvider() {
  const rpcUrl = import.meta.env.VITE_RPC_URL || PUBLIC_SEPOLIA_RPC;
  return new ethers.JsonRpcProvider(rpcUrl);
}

export function getPublicAuctionContract(address, provider = getPublicProvider()) {
  return new ethers.Contract(address, AuctionABI, provider);
}

export async function getAuctionChainData(address, signerOrProvider) {
  const contract = new ethers.Contract(address, AuctionABI, signerOrProvider);

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
