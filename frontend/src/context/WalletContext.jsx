import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { jwtDecode } from "jwt-decode";

import { createUser, getUser } from "../services/userService";
import { createNonce, Login } from "../services/authservice";

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
            return account;
        } catch (err) {
            console.error(err);
        }
    }

    async function connectWallet() {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                const decoded = jwtDecode(token);

                if (decoded.exp > Date.now() / 1000) {
                    console.log("Valid token exists");
                    return;
                }
            } catch {
                localStorage.removeItem("token");
            }
        }

        if (!provider) {
            alert("Please install MetaMask");
            return;
        }

        try {

            await provider.send("eth_requestAccounts", []);

            const walletSigner = await provider.getSigner();

            const account = await initializeUser(walletSigner);

            const { nonce } = await createNonce(account);

            const message = `Welcome to Vickrey Auction Nonce: ${nonce}`;

            const signature = await walletSigner.signMessage(message);

            const { token } = await Login({
                wallet: account,
                signature,
            });

            localStorage.setItem("token", token);

        } catch (err) {
            console.error(err);
        }
    }

    // Forces MetaMask's account picker to reopen, then reconnects with whichever account is chosen
    async function switchAccount() {
        if (!provider) {
            alert("Please install MetaMask");
            return;
        }

        try {
            // Clear existing session so connectWallet() doesn't short-circuit on a valid token
            localStorage.removeItem("token");
            setSigner(null);
            setAccount("");

            await window.ethereum.request({
                method: "wallet_requestPermissions",
                params: [{ eth_accounts: {} }],
            });

            await connectWallet();
        } catch (err) {
            console.error(err);
        }
    }

function disconnectWallet() {
    localStorage.removeItem("token");
    setAccount("");
    setSigner(null);
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
                switchAccount,
                disconnectWallet,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    return useContext(WalletContext);
}