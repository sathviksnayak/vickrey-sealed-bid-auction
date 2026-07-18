import { useEffect, useState } from "react";
import "./mybids.css";

import { useWallet } from "../../context/WalletContext";
import BidCard from "../../components/bidcard/BidCard";

import { useAuthGuard } from "../../hooks/useAuthGuard";

import { getMyBids } from "../../services/bidService";
import { getAuction } from "../../services/auctionService";

import { getAuctionChainData } from "../../services/blockchainService";

export default function MyBids() {
  const auth = useAuthGuard();
  const { account, signer, authenticated } = useWallet();

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAuctions() {
      setLoading(true);

      try {
        if (!(await auth.ensureAuthenticated())) {
          return;
        }

        const auctions = await getMyBids();

        const auctionList = await Promise.all(
          auctions.map(async (auction) => {
            const [metadata, chainData] = await Promise.all([
              getAuction(auction.auctionAddress),
              getAuctionChainData(auction.auctionAddress, signer),
            ]);

            return {
              ...auction,
              ...metadata,
              ...chainData,
            };
          })
        );

        setAuctions(auctionList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAuctions();
  }, [signer, account, authenticated]);

  let content;

  if (!signer) {
    content = <h1>Connect your wallet</h1>;
  } else if (loading) {
    content = <h2>Loading your bids...</h2>;
  } else if (auctions.length === 0) {
    content = <h2>No bids found.</h2>;
  } else {
    content = (
      <>
        <h1>Your Bids</h1>
        <div className="my-bids-list">
          {auctions.map((auction) => (
            <BidCard
              key={auction.auctionAddress}
              auction={auction}
              account={account}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <div>
      {content}
      {auth.modal}
    </div>
  );
}
