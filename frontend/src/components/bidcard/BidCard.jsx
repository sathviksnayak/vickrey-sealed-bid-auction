import { Link } from "react-router-dom";

export default function BidCard({ auction }) {

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
                {new Date(auction.commitDeadline * 1000).toLocaleString()}
            </p>

            <p>
                <strong>Reveal Deadline:</strong>{" "}
                {new Date(auction.revealDeadline * 1000).toLocaleString()}
            </p>

            <p><strong>Penalty:</strong> {auction.penalty}%</p>

            <p><strong>Status:</strong> {status}</p>

            <hr />

            <p>
                <strong>Bid Status:</strong>{" "}
                {auction.revealed ? "Revealed" : "Committed"}
            </p>

            <p>
                <strong>Committed At:</strong>{" "}
                {new Date(auction.committedAt).toLocaleString()}
            </p>

            {auction.revealed && (
                <p>
                    <strong>Revealed At:</strong>{" "}
                    {new Date(auction.revealedAt).toLocaleString()}
                </p>
            )}

            <Link to={`/auction/${auction.auctionAddress}`}>
                <button>View Auction</button>
            </Link>

        </div>
    );
}