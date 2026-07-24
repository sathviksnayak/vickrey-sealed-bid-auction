export function parseBlockchainError(err) {
  if (!err) return "Unknown error.";

  if (typeof err === "string") return err;

  const msg =
    err.shortMessage ||
    err.reason ||
    err.data?.message ||
    err.info?.error?.message ||
    err.message ||
    "";

  if (msg.toLowerCase().includes("user rejected"))
    return "Transaction was rejected.";

  if (msg.toLowerCase().includes("insufficient funds"))
    return "Insufficient funds.";

  if (msg.toLowerCase().includes("execution reverted"))
    return "Transaction failed. Auction conditions were not satisfied.";

  return msg || "Unexpected blockchain error.";
}