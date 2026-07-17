export function parseBlockchainError(err) {
    if (!err) return "Unknown error.";

    console.log(err);

    const msg =
        err.shortMessage ||
        err.reason ||
        err.data?.message ||
        err.info?.error?.message ||
        err.message ||
        "";

    console.log(msg);

    if (msg.toLowerCase().includes("user rejected"))
        return "Transaction was rejected.";

    if (msg.toLowerCase().includes("insufficient funds"))
        return "Insufficient funds.";

    if (msg.toLowerCase().includes("execution reverted")) {
        console.log("Selector:", err.data);
        console.log("Data:", err.info?.error?.data);
        return "Transaction failed. Auction conditions were not satisfied.";
    }

    return msg || "Unexpected blockchain error.";
}