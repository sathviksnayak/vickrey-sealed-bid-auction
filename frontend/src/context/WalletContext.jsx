import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
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
  const [walletError, setWalletError] = useState(null);

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

  async function initializeUser(walletSigner) {
    try {
      const addr = await walletSigner.getAddress();

      setSigner(walletSigner);
      setAccount(addr);

      // Clear any stale wallet connection error once
      // the wallet has been successfully initialized.
      setWalletError(null);

      const user = await getUser(addr);

      if (!user) {
        await createUser(addr);
      }

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
    if (!provider) {
      setWalletError(
        "MetaMask not detected. Please install it to continue."
      );
      return false;
    }

    try {
      setWalletError(null);

      await provider.send("eth_requestAccounts", []);

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

      // We're intentionally changing accounts.
      // Don't let accountsChanged listener react separately.
      suppressNextAccountsChanged.current = true;

      localStorage.removeItem("token");

      setSigner(null);
      setAccount("");
      setAuthenticated(false);

      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      // connectWallet() will prompt for a fresh signature
      // because the previous token was removed.
      await connectWallet();
    } catch (err) {
      console.error("Failed to switch account:", err);

      setWalletError("Failed to switch account. Please try again.");
    } finally {
      suppressNextAccountsChanged.current = false;
    }
  }

  function disconnectWallet() {
    localStorage.removeItem("token");

    setAccount("");
    setSigner(null);
    setAuthenticated(false);
    setWalletError(null);
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

    function handleAccountsChanged() {
      if (suppressNextAccountsChanged.current) {
        // We caused this change ourselves through switchAccount().
        return;
      }

      disconnectWallet();

      window.location.reload();
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
    };
  }, []);

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