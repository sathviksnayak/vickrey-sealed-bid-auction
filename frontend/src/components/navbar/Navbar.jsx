import { Link } from "react-router-dom";
import "./Navbar.css";
import { useWallet } from "../../context/WalletContext";

export default function Navbar() {
    const { account, connectWallet } = useWallet();
    
    return (
        <nav className="navbar">

            <div className="navbar-logo">
                <Link to="/">
                    Vickrey Auction
                </Link>
            </div>

            <div className="navbar-links">

                <Link to="/">
                  Browse auction
                </Link>

                <Link to="/create">
                    Create Auction
                </Link>

                <Link to="/my-auctions">
                    My Auctions
                </Link>

                <Link to="/my-bids">
                    My Bids
                </Link>

                <Link to="/profile">profile</Link>



            </div>

            <button className="wallet-button" onClick={connectWallet}>
                 {account ? `${account.slice(0,6)}...${account.slice(-4)}`: "Connect Wallet"}  
            </button>

        </nav>
    );
}