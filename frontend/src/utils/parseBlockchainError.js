import { ethers } from "ethers";
import ABI from "../abi/VickreyAuction.json";

const iface = new ethers.Interface(ABI);

export function parseBlockchainError(err) {
  if (!err) return "Unknown error.";

  if (typeof err === "string") {
    return err;
  }

  // MetaMask user rejection
  if (
    err.code === 4001 ||
    err.info?.error?.code === 4001 ||
    err.error?.code === 4001
  ) {
    return "Transaction was rejected.";
  }

  // Try to find Solidity revert data.
  const revertData =
    err.data ||
    err.error?.data ||
    err.info?.error?.data ||
    err.info?.error?.data?.data;

  if (
    typeof revertData === "string" &&
    revertData.startsWith("0x") &&
    revertData.length >= 10
  ) {
    try {
      const decoded = iface.parseError(revertData);

      if (decoded) {
        return formatContractError(decoded.name);
      }
    } catch {
      // Not a VickreyAuction custom error.
      // Continue to normal error handling.
    }
  }

  const msg = (
    err.shortMessage ||
    err.reason ||
    err.info?.error?.message ||
    err.error?.message ||
    err.message ||
    ""
  ).toLowerCase();

  if (msg.includes("insufficient funds")) {
    return "Insufficient funds.";
  }

  if (msg.includes("user rejected")) {
    return "Transaction was rejected.";
  }

  if (msg.includes("execution reverted")) {
    return "Transaction failed. Auction conditions were not satisfied.";
  }

  return (
    err.shortMessage ||
    err.reason ||
    err.info?.error?.message ||
    err.error?.message ||
    err.message ||
    "Unexpected blockchain error."
  );
}

function formatContractError(errorName) {
  const messages = {
    AlreadyCommitted:
      "You have already committed a bid.",

    AlreadyRefunded:
      "Your refund has already been withdrawn.",

    AuctionAlreadyFinalized:
      "This auction has already been finalized.",

    BidAlreadyRevealed:
      "You have already revealed your bid.",

    CommitPhaseEnded:
      "The commit phase has ended.",

    CommitPhaseNotEnded:
      "The commit phase has not ended yet.",

    InsufficientDeposit:
      "Your deposit is insufficient for this bid.",

    InvalidDeposit:
      "Your deposit does not meet the required amount.",

    InvalidDuration:
      "The auction duration is invalid.",

    InvalidPenaltyPercent:
      "The penalty percentage is invalid.",

    InvalidReveal:
      "The bid amount or secret does not match your commitment.",

    NoCommitmentFound:
      "No committed bid was found for your wallet.",

    NotFinalised:
      "The auction has not been finalized yet.",

    RevealPhaseEnded:
      "The reveal phase has ended.",

    RevealPhaseNotEnded:
      "The reveal phase has not ended yet.",

    SellerCannotBid:
      "The seller cannot bid on their own auction.",

    TransferFailed:
      "The funds transfer failed.",
  };

  return (
    messages[errorName] ||
    `Transaction failed: ${errorName}`
  );
}