import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

import { createUser,getUser } from "../services/userService";


const WalletContext = createContext();

export function WalletProvider({ children }) {

    const [account, setAccount] = useState("");
    const [provider] = useState(() => {
        if (!window.ethereum) return null;
        return new ethers.BrowserProvider(window.ethereum);
    });
    const [signer, setSigner] = useState(null);


async function initializeUser(walletSigner) {
    try {
        const account = await walletSigner.getAddress();

        setSigner(walletSigner);
        setAccount(account);

        const user = await getUser(account);

        if (!user) {
            await createUser(account);
        }
    } catch (err) {
        console.error(err);
    }
}


    async function connectWallet() {

        if (!provider) {
            alert("Please install MetaMask");
            return;
        }

        try {

            await provider.send("eth_requestAccounts", []);

            const walletSigner = await provider.getSigner();

 await initializeUser(walletSigner);



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



            await initializeUser(walletSigner);
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