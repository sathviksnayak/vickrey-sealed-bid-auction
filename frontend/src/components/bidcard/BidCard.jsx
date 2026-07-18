import { Link } from "react-router-dom";
import { ethers } from "ethers";
import "./BidCard.css";

const statusConfig = {
  "Commit Phase": { dot: "🟢", className: "commit-phase" },
  "Reveal Phase": { dot: "🟠", className: "reveal-phase" },
  Finalized: { dot: "⚫", className: "finalized" },
  "Awaiting Finalization": { dot: "🔵", className: "awaiting-finalization" },
};

function formatDateTime(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BidCard({ auction, account }) {
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

  // Bid status: Revealed > Not Revealed (missed deadline) > Committed
  let bidStatus;
  if (auction.revealed) {
    bidStatus = "Revealed";
  } else if (now > auction.revealDeadline) {
    bidStatus = "Not Revealed";
  } else {
    bidStatus = "Committed";
  }

  // Result: Pending until finalized, Penalty Applied if never revealed, else Won/Lost
  let result;
  if (!auction.finalized) {
    result = "⏳ Pending";
  } else if (bidStatus === "Not Revealed") {
    result = "⚠️ Penalty Applied";
  } else if (auction.highestBidder?.toLowerCase() === account?.toLowerCase()) {
    result = "🏆 Won";
  } else {
    result = "❌ Lost";
  }

  return (
    <Link to={`/auction/${auction.auctionAddress}`} className="bid-card">
      {auction.images?.length > 0 ? (
        <img
          src={auction.images[0]}
          alt={auction.title}
          className="bid-card-image"
        />
      ) : (
        <div className="bid-card-image-placeholder">No Image</div>
      )}

      <div className="bid-card-content">
        <div className="bid-card-header">
          <div>
            <h2>{auction.title}</h2>
            <p>{auction.category.toUpperCase()}</p>
          </div>

          <span className={`status ${className}`}>
            {dot} {status}
          </span>
        </div>

        <div className="bid-stats-grid">
          <div className="stat-col">
            <span>Auction Address</span>
            <strong>
              {auction.auctionAddress.slice(0, 8)}...
              {auction.auctionAddress.slice(-6)}
            </strong>
          </div>

          <div className="stat-col">
            <span>Bid Status</span>
            <strong>{bidStatus}</strong>
          </div>

          <div className="stat-col">
            <span>Result</span>
            <strong>{result}</strong>
          </div>

          <div className="stat-col">
            <span>Committed At</span>
            <strong>{formatDateTime(auction.committedAt)}</strong>
          </div>

          <div className="stat-col">
            <span>Revealed At</span>
            <strong>
              {auction.revealed ? formatDateTime(auction.revealedAt) : "—"}
            </strong>
          </div>
        </div>

        <div className="view-link">View Details →</div>
      </div>
    </Link>
  );
}
