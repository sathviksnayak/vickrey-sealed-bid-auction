import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { ethers } from "ethers";
import { jwtDecode } from "jwt-decode";

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
  const [walletError, setWalletError] = useState(null);

  const connectWalletInFlight = useRef(null);

  // Tracks whether the next accountsChanged event should be ignored,
  // because we triggered the account change ourselves via switchAccount().
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

  async function syncWalletStateFromAccounts(accounts) {
    const previousAccount = account;
    const previousSigner = signer;

    console.log("[WALLET] account before event ->", previousAccount);
    console.log("[WALLET] signer before event ->", previousSigner);
    console.log("[METAMASK] accountsChanged ->", accounts);

    if (!accounts || accounts.length === 0) {
      console.log("[METAMASK] eth_accounts -> []");
      localStorage.removeItem("token");
      setSigner(null);
      setAccount("");
      setAuthenticated(false);
      console.log("[AUTH] authenticated after reset -> false");
      return;
    }

    const nextAccount = accounts[0];
    console.log("[WALLET] account after event ->", nextAccount);

    const nextSigner = await provider.getSigner();
    console.log("[WALLET] signer after event ->", nextSigner);

    setSigner(nextSigner);
    setAccount(nextAccount);

    const nextAuthenticated = hasValidTokenFor(nextAccount);
    setAuthenticated(nextAuthenticated);
    console.log("[AUTH] authenticated after reset ->", nextAuthenticated);

    if (!nextAuthenticated) {
      localStorage.removeItem("token");
    }
  }

  async function initializeUser(walletSigner) {
    try {
      const addr = await walletSigner.getAddress();

      setSigner(walletSigner);
      setAccount(addr);

      // Clear any stale wallet connection error once
      // the wallet has been successfully initialized.
      setWalletError(null);

      return addr;
    } catch (err) {
      console.error("Failed to initialize wallet user:", err);

      // Do not swallow the error.
      // Let connectWallet()/restoreWallet() handle it.
      throw err;
    }
  }

  // Full authentication flow:
  // request accounts → initialize user → check JWT →
  // sign nonce if necessary → receive JWT.
  async function connectWallet() {
    if (connectWalletInFlight.current) {
      return connectWalletInFlight.current;
    }

    if (!provider) {
      setWalletError(
        "MetaMask not detected. Please install it to continue."
      );
      return false;
    }

    connectWalletInFlight.current = (async () => {
      try {
        setWalletError(null);

        const accounts = await provider.send("eth_requestAccounts", []);
        console.log("[METAMASK] eth_requestAccounts ->", accounts);

        const walletSigner = await provider.getSigner();
        const addr = await initializeUser(walletSigner);

        if (hasValidTokenFor(addr)) {
          setAuthenticated(true);
          setWalletError(null);
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

        setAuthenticated(true);
        setWalletError(null);

        return true;
      } catch (err) {
        console.error("Failed to connect wallet:", err);

        setWalletError("Failed to connect wallet. Please try again.");

        return false;
      }
    })();

    try {
      return await connectWalletInFlight.current;
    } finally {
      connectWalletInFlight.current = null;
    }
  }

  async function switchAccount() {
    if (!provider) {
      setWalletError(
        "MetaMask not detected. Please install it to continue."
      );
      return;
    }

    try {
      setWalletError(null);

      console.log("[METAMASK] wallet_requestPermissions -> start");
      const permissions = await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      console.log("[METAMASK] wallet_requestPermissions ->", permissions);

      const accounts = await provider.send("eth_accounts", []);
      console.log("[METAMASK] eth_accounts ->", accounts);

      if (!accounts || accounts.length === 0) {
        setWalletError("Account switch was cancelled.");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Failed to switch account:", err);

      setWalletError("Failed to switch account. Please try again.");
      return false;
    }
  }

  function disconnectWallet() {
    console.log("[AUTH] authenticated before reset ->", authenticated);
    localStorage.removeItem("token");

    setAccount("");
    setSigner(null);
    setAuthenticated(false);
    setWalletError(null);
    console.log("[AUTH] authenticated after reset -> false");
  }

  // Restore MetaMask's currently connected account on mount.
  //
  // This does NOT automatically request a signature.
  // Authentication is only restored when a valid matching JWT exists.
  useEffect(() => {
    async function restoreWallet() {
      if (!provider) return;

      try {
        const accounts = await provider.send("eth_accounts", []);
        console.log("[METAMASK] eth_accounts ->", accounts);

        if (accounts.length === 0) return;

        const walletSigner = await provider.getSigner();

        const addr = await initializeUser(walletSigner);

        setAuthenticated(hasValidTokenFor(addr));

        // Clear any stale error from a previous connection attempt.
        setWalletError(null);
      } catch (err) {
        console.error("Failed to restore wallet:", err);

        setWalletError("Failed to restore wallet connection.");
      }
    }

    restoreWallet();
  }, [provider]);

  // Listen for MetaMask account changes.
  useEffect(() => {
    if (!window.ethereum) return;

    async function handleAccountsChanged(accounts) {
      if (suppressNextAccountsChanged.current) {
        console.log("[METAMASK] accountsChanged ignored due to switch suppression");
        return;
      }

      await syncWalletStateFromAccounts(accounts);
    }

    function handleChainChanged() {
      console.log("[METAMASK] chainChanged ->", "network changed");
      disconnectWallet();
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [account, authenticated, provider, signer]);

  // Automatically clear temporary wallet errors after 5 seconds.
  useEffect(() => {
    if (!walletError) return;

    const timer = setTimeout(() => {
      setWalletError(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [walletError]);

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
        walletError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}