import { createContext, useContext, useState } from "react";
import { ethers } from "ethers";
import ABI from "../abi/VickreyAuction.json";
import { CONTRACT_ADDRESS } from "../utils/constants";

const WalletContext = createContext();

export function WalletProvider({ children }) {

    const [account, setAccount] = useState("");

    const [provider, setProvider] = useState(null);

    const [Signer, setSigner] = useState(null);

    const [contract, setContract] = useState(null);

    async function connectWallet() {



        if (!window.ethereum) {
            alert("Please install MetaMask");
            return;
        }

        try {

        const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
        const browserProvider = new ethers.BrowserProvider(window.ethereum);

        setProvider(browserProvider);

        const signer = await browserProvider.getSigner();

        setSigner(signer);
             
        setAccount(accounts[0]);


            const contractInstance = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    ABI,
                    signer
                );

        setContract(contractInstance);


   

        } catch (err) {
            console.error(err);
        }

    }

    return (
        <WalletContext.Provider
            value={{
                account,
                provider,
                Signer,
                contract,
                connectWallet,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}