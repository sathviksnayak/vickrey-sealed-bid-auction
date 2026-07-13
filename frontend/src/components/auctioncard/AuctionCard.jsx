
import { Link } from "react-router-dom";
export default  function AuctionCard({ auction}){
    const now = Math.floor(Date.now() / 1000);

let status;

if (auction.finalized) {
    status = "Finalized";
}
else if (now < auction.commitDeadline) {
    status = "Commit Phase";
}
else if (now < auction.revealDeadline) {
    status = "Reveal Phase";
}
else {
    status = "Awaiting Finalization";
}


    return (
        <div>

           

            <p>Seller: {auction.seller}</p>

            <p>
                Commit Deadline:
                {" "}
                {new Date(auction.commitDeadline * 1000).toLocaleString()}
            </p>

            <p>
                Reveal Deadline:
                {" "}
                {new Date(auction.revealDeadline * 1000).toLocaleString()}
            </p>

            <p>Penalty: {auction.penalty}%</p>


            <p>
            status: {status}

            </p>

            <Link to={`/auction/${auction.address}`}>
                <button>View Auction</button>
            </Link>

        </div>
    ); 
}