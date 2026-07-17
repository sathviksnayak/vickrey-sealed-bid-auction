import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import "./AuctionCard.css";

const statusConfig = {
    "Commit Phase": { dot: "🟢", className: "commit-phase" },
    "Reveal Phase": { dot: "🟠", className: "reveal-phase" },
    "Finalized": { dot: "⚫", className: "finalized" },
    "Awaiting Finalization": { dot: "🟣", className: "awaiting-finalization" },
};

export default function AuctionCard({ auction}) {
    const navigate = useNavigate();
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

    const { dot, className } = statusConfig[status];

    return (
        <div
            className="auction-card"
            onClick={() => navigate(`/auction/${auction.auctionAddress}`)}
        >
            {auction.images?.length > 0 ? (
                <img
                    src={auction.images[0]}
                    alt={auction.title}
                    className="auction-image"
                />
            ) : (
                <div className="auction-image-placeholder">No Image</div>
            )}

            <div className="auction-content">
                <h3 className="auction-title">{auction.title}</h3>
                <p className="category">{auction.category}</p>

                <div className="reserve-block">
                    <span className="reserve-label">Reserve</span>
                    <span className="reserve-value">
                        {ethers.formatEther(auction.reservePrice)} ETH
                    </span>
                </div>

                <span className={`status ${className}`}>
                    {dot} {status}
                </span>



                <div className="view-details">View Details →</div>
            </div>
        </div>
    );
}