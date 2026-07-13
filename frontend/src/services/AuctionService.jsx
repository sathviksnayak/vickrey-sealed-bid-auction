import { ethers } from "ethers";
import AuctionABI from "../abi/VickreyAuction.json";

const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";

export async function getAuctionContract() {
    if (!window.ethereum) {
        throw new Error("MetaMask not found");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    return new ethers.Contract(
        CONTRACT_ADDRESS,
        AuctionABI.abi,
        signer
    );
}