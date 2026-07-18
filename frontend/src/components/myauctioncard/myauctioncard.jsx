import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import "./myauctioncard.css";

const statusConfig = {
  "Commit Phase": { dot: "🟢", className: "commit-phase" },
  "Reveal Phase": { dot: "🟠", className: "reveal-phase" },
  Finalized: { dot: "⚫", className: "finalized" },
  "Awaiting Finalization": { dot: "🔵", className: "awaiting-finalization" },
};

function formatCountdown(targetSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const diff = targetSeconds - now;

  if (diff <= 0) {
    const elapsed = Math.abs(diff);
    const hours = Math.floor(elapsed / 3600);
    if (hours < 1) return `Ended ${Math.floor(elapsed / 60)}m ago`;
    if (hours < 24) return `Ended ${hours}h ago`;
    return `Ended ${Math.floor(hours / 24)}d ago`;
  }

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function MyAuctionCard({ auction }) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceTick((n) => n + 1), 60000);
    return () => clearInterval(interval);
  }, []);

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

  const activeDeadline =
    status === "Commit Phase" ? auction.commitDeadline : auction.revealDeadline;

  return (
    <Link to={`/auction/${auction.auctionAddress}`} className="my-auction-card">
      <img
        src={auction.images?.[0]}
        alt={auction.title}
        className="my-auction-image"
      />

      <div className="my-auction-content">
        <div className="my-auction-header">
          <div>
            <h2>{auction.title}</h2>
            <p>{auction.category.toUpperCase()}</p>
          </div>

          <span className={`status ${className}`}>
            {dot} {status}
          </span>
        </div>

        <div className="auction-stats-grid">
          <div className="stat-col">
            <span>Reserve</span>
            <strong>{ethers.formatEther(auction.reservePrice)} ETH</strong>
          </div>

          <div className="stat-col">
            <span>{auction.finalized ? "Highest Bid" : "Ends in"}</span>
            <strong>
              {auction.finalized &&
              auction.highestBidder === ethers.ZeroAddress ? (
                <>
                  <strong>None</strong>
                </>
              ) : (
                <>
                  <strong>{ethers.formatEther(auction.highestBid)} ETH</strong>
                </>
              )}
            </strong>
          </div>

          <div className="stat-col">
            <span>Result</span>
            <strong>
              {auction.finalized
                ? auction.highestBidder !== ethers.ZeroAddress
                  ? "✅ Sold"
                  : "❌ Unsold"
                : "⏳ Pending"}
            </strong>
          </div>
        </div>

        <div className="view-link">View Details →</div>
      </div>
    </Link>
  );
}
