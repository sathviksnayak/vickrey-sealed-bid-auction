import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

const WalletContext = createContext();

export function WalletProvider({ children }) {

    const [account, setAccount] = useState("");
    const [provider] = useState(() => {
        if (!window.ethereum) return null;
        return new ethers.BrowserProvider(window.ethereum);
    });
    const [signer, setSigner] = useState(null);

    async function connectWallet() {

        if (!provider) {
            alert("Please install MetaMask");
            return;
        }

        try {

            await provider.send("eth_requestAccounts", []);

            const walletSigner = await provider.getSigner();

            setSigner(walletSigner);
            setAccount(await walletSigner.getAddress());

        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {

        async function restoreWallet() {

            if (!provider) return;

            const accounts = await provider.send("eth_accounts", []);

            if (accounts.length === 0) return;

            const walletSigner = await provider.getSigner();

            setSigner(walletSigner);
            setAccount(await walletSigner.getAddress());   // <-- use getAddress here too
        }

        restoreWallet();

    }, [provider]);

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