import { Link } from "react-router-dom";
import { ethers } from "ethers";
export default function AuctionCard({ auction }) {

    const now = Math.floor(Date.now() / 1000);

    let status;

    if (auction.finalized) {
        status = "Finalized";
    } else if (now < auction.commitDeadline) {
        status = "Commit Phase";
    } else if (now < auction.revealDeadline) {
        status = "Reveal Phase";
    } else {
        status = "Awaiting Finalization";
    }

    return (
        <div>

            <h2>{auction.title}</h2>

            <p><strong>Category:</strong> {auction.category}</p>

            <p>
                {auction.description.length > 100
                    ? auction.description.slice(0, 100) + "..."
                    : auction.description}
            </p>

            <p>
                <strong>Seller:</strong>{" "}
                {auction.seller.slice(0, 6)}...
                {auction.seller.slice(-4)}
            </p>

            <p>
                <strong>Commit Deadline:</strong>{" "}
                {new Date(
                    auction.commitDeadline * 1000
                ).toLocaleString()}
            </p>

            <p>
                <strong>Reveal Deadline:</strong>{" "}
                {new Date(
                    auction.revealDeadline * 1000
                ).toLocaleString()}
            </p>

            <p>
                <strong>ReservePrice:</strong>{" "}
              {ethers.formatEther(auction.reservePrice)} ETH
            
            </p>

            <p><strong>Penalty:</strong> {auction.penalty}%</p>

            <p><strong>Status:</strong> {status}</p>

            <Link to={`/auction/${auction.auctionAddress}`}>
                <button>View Auction</button>
            </Link>

        </div>
    );
}