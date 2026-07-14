import { createContext, useContext, useState } from "react";
import { ethers } from "ethers";

const WalletContext = createContext();

export function WalletProvider({ children }) {

    const [account, setAccount] = useState("");
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

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

            const walletSigner = await browserProvider.getSigner();

            setProvider(browserProvider);
            setSigner(walletSigner);
            setAccount(accounts[0]);

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <WalletContext.Provider
            value={{
                account,
                provider,
                signer,
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