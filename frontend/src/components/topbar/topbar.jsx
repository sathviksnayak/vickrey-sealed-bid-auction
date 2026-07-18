import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Wallet,
  ChevronDown,
  Copy,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import "./topbar.css";
import { useWallet } from "../../context/WalletContext";

export default function Topbar({ sidebarOpen, setSidebarOpen }) {
  const { account, connectWallet, switchAccount, disconnectWallet } =
    useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(account);
    setMenuOpen(false);
  }

  async function handleSwitchAccount() {
    setMenuOpen(false);
    await switchAccount();
  }

  function handleDisconnect() {
    disconnectWallet();
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="sidebar-toggle"
          aria-label="Toggle sidebar"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={20} />
        </button>

        <img src="/logo.png" alt="BidForge" className="logo" />

        <Link to="/" className="topbar-logo">
          BidForge
        </Link>
      </div>

      {account ? (
        <div className="wallet-menu-wrapper" ref={menuRef}>
          <button
            className="wallet-button"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Wallet size={16} />
            {`${account.slice(0, 6)}...${account.slice(-4)}`}
            <ChevronDown size={14} />
          </button>

          {menuOpen && (
            <div className="wallet-dropdown">
              <div className="wallet-dropdown-label">Wallet</div>

              <div className="wallet-dropdown-address">
                {`${account.slice(0, 6)}...${account.slice(-4)}`}
              </div>

              <button className="wallet-dropdown-item" onClick={handleCopy}>
                <Copy size={14} /> Copy Address
              </button>

              <div className="wallet-dropdown-divider" />

              <button
                className="wallet-dropdown-item"
                onClick={handleSwitchAccount}
              >
                <RefreshCw size={14} /> Switch Account
              </button>

              <button
                className="wallet-dropdown-item danger"
                onClick={handleDisconnect}
              >
                <LogOut size={14} /> Disconnect
              </button>
            </div>
          )}
        </div>
      ) : (
        <button className="wallet-button" onClick={connectWallet}>
          <Wallet size={16} />
          Connect Wallet
        </button>
      )}
    </header>
  );
}
