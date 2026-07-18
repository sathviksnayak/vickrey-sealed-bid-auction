import { createContext, useContext, useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { jwtDecode } from "jwt-decode";

import { createUser, getUser } from "../services/userService";
import { createNonce, Login } from "../services/authservice";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);

  const [account, setAccount] = useState("");
  const [provider] = useState(() => {
    if (!window.ethereum) return null;
    return new ethers.BrowserProvider(window.ethereum);
  });
  const [signer, setSigner] = useState(null);

  // Tracks whether the *next* accountsChanged event should be ignored,
  // because we triggered the account change ourselves via switchAccount()
  const suppressNextAccountsChanged = useRef(false);

  function hasValidTokenFor(walletAddress) {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const matches =
        decoded.wallet?.toLowerCase() === walletAddress?.toLowerCase();
      const notExpired = decoded.exp > Date.now() / 1000;
      return matches && notExpired;
    } catch {
      localStorage.removeItem("token");
      return false;
    }
  }

  async function initializeUser(walletSigner) {
    try {
      const addr = await walletSigner.getAddress();

      setSigner(walletSigner);
      setAccount(addr);

      const user = await getUser(addr);

      if (!user) {
        await createUser(addr);
      }
      return addr;
    } catch (err) {
      console.error(err);
    }
  }

  // Full auth flow: request accounts, sign nonce, get JWT.
  // Only actually prompts for a signature if there's no valid token for the active account.
  async function connectWallet() {
    if (!provider) {
      alert("Please install MetaMask");
      return;
    }

    try {
      await provider.send("eth_requestAccounts", []);

      const walletSigner = await provider.getSigner();
      const addr = await initializeUser(walletSigner);

      if (hasValidTokenFor(addr)) {
        console.log("Valid token exists for this account");
        return true;
      }

      const { nonce } = await createNonce(addr);
      const message = `Welcome to Vickrey Auction Nonce: ${nonce}`;
      const signature = await walletSigner.signMessage(message);

      const { token } = await Login({
        wallet: addr,
        signature,
      });

      localStorage.setItem("token", token);
    } catch (err) {
      console.error(err);
    } finally {
    }
  }

  async function switchAccount() {
    if (!provider) {
      alert("Please install MetaMask");
      return;
    }

    try {
      // We're intentionally changing accounts — don't let the
      // accountsChanged listener also react and reload underneath us
      suppressNextAccountsChanged.current = true;

      localStorage.removeItem("token");
      setSigner(null);
      setAccount("");

      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      await connectWallet(); // this will prompt for a fresh signature, since token was just cleared
    } catch (err) {
      console.error(err);
    } finally {
      suppressNextAccountsChanged.current = false;
    }
  }

  function disconnectWallet() {
    localStorage.removeItem("token");
    setAccount("");
    setSigner(null);
  }

  // On mount: reflect MetaMask's connected account in the UI (if any),
  // but do NOT treat it as authenticated unless a valid matching token exists.
  useEffect(() => {
    async function restoreWallet() {
      if (!provider) return;

      const accounts = await provider.send("eth_accounts", []);

      if (accounts.length === 0) return;

      const walletSigner = await provider.getSigner();
      await initializeUser(walletSigner);
      // Deliberately NOT calling connectWallet()/sign flow here.
      // If there's no valid token, useAuthGuard will catch it on the
      // next auth-required action and prompt the user then —
      // avoids signing on every page load.
    }

    restoreWallet();
  }, [provider]);

  useEffect(() => {
    if (!window.ethereum) return;

    function handleAccountsChanged() {
      if (suppressNextAccountsChanged.current) {
        // We caused this change ourselves via switchAccount() —
        // let switchAccount's own connectWallet() call finish instead of reloading
        return;
      }
      disconnectWallet();
      window.location.reload();
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        connectWallet,
        switchAccount,
        disconnectWallet,
        authenticated,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
