import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { useWallet } from "../../context/WalletContext";
import AuctionCard from "../../components/auctioncard/AuctionCard";

import "./browse.css";
import { getAuctionChainData } from "../../services/blockchainService";
import { getAuctions } from "../../services/auctionService";

function getPhase(auction) {
  if (auction.finalized) return "Finalized";
  const now = Math.floor(Date.now() / 1000);
  if (now < auction.commitDeadline) return "Commit Phase";
  if (now < auction.revealDeadline) return "Reveal Phase";
  return "Awaiting Finalization";
}

export default function Browse() {
  const { provider } = useWallet();

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function loadAuctions() {
      try {
        setLoading(true);

        // fall back to a read-only provider so browsing works
        // even before a wallet is connected
        const readProvider =
          provider || new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);

        const auctions = await getAuctions();
        const auctionList = await Promise.all(
          auctions.map(async (auction) => {
            const chainData = await getAuctionChainData(
              auction.auctionAddress,
              readProvider
            );

            return {
              ...auction,
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
  }, [provider]);

  const filteredAuctions = auctions
    .filter((a) => phaseFilter === "all" || getPhase(a) === phaseFilter)
    .sort((a, b) =>
      sortBy === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : a.commitDeadline - b.commitDeadline
    );

  if (loading) {
    return <h2>Loading auctions...</h2>;
  }

  return (
    <div>
      <div className="browse-controls">
        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
        >
          <option value="all">All Phases</option>
          <option value="Commit Phase">Commit Phase</option>
          <option value="Reveal Phase">Reveal Phase</option>
          <option value="Awaiting Finalization">Awaiting Finalization</option>
          <option value="Finalized">Finalized</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="ending">Ending Soon</option>
        </select>
      </div>

      {filteredAuctions.length === 0 ? (
        <h2>No auctions found.</h2>
      ) : (
        <div className="auction-grid">
          {filteredAuctions.map((auction) => (
            <AuctionCard key={auction.auctionAddress} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}