import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { useWallet } from "../../context/WalletContext";
import AuctionCard from "../../components/auctioncard/AuctionCard";

import { getAuctionChainData } from "../../services/blockchainService";
import { getAuctions } from "../../services/auctionService";

import "./browse.css";

function getPhase(auction) {
  if (auction.finalized) {
    return "Finalized";
  }

  const now = Math.floor(Date.now() / 1000);

  if (now < auction.commitDeadline) {
    return "Commit Phase";
  }

  if (now < auction.revealDeadline) {
    return "Reveal Phase";
  }

  return "Awaiting Finalization";
}

function getEndingTimestamp(auction) {
  if (auction.finalized) {
    return Number.MAX_SAFE_INTEGER;
  }

  const now = Math.floor(Date.now() / 1000);

  if (now < auction.commitDeadline) {
    return auction.commitDeadline;
  }

  return auction.revealDeadline;
}

export default function Browse() {
  const { provider } = useWallet();

  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [phaseFilter, setPhaseFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const hasMetaMask =
    typeof window !== "undefined" && Boolean(window.ethereum);

  useEffect(() => {
    let cancelled = false;

    async function loadAuctions() {
      try {
        setLoading(true);

        const readProvider =
          provider ||
          new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);

        const auctionMetadata = await getAuctions();

        const auctionList = await Promise.all(
          auctionMetadata.map(async (auction) => {
            try {
              const chainData = await getAuctionChainData(
                auction.auctionAddress,
                readProvider
              );

              return {
                ...auction,
                ...chainData,
              };
            } catch (err) {
              console.error(
                `Failed to load auction ${auction.auctionAddress}:`,
                err
              );

              return null;
            }
          })
        );

        if (!cancelled) {
          setAuctions(auctionList.filter(Boolean));
        }
      } catch (err) {
        console.error("Failed to load auctions:", err);

        if (!cancelled) {
          setAuctions([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAuctions();

    return () => {
      cancelled = true;
    };
  }, [provider]);

  const filteredAuctions = auctions
    .filter((auction) => {
      if (phaseFilter === "all") {
        return true;
      }

      return getPhase(auction) === phaseFilter;
    })
    .slice()
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      }

      return getEndingTimestamp(a) - getEndingTimestamp(b);
    });

  if (loading) {
    return (
      <div className="browse-state">
        <h2>Loading auctions...</h2>
      </div>
    );
  }

  return (
    <div className="browse-page">
      {!hasMetaMask && (
        <div className="metamask-banner">
          <span>
MetaMask not detected. You’ll need it to access the auction platform.
          </span>

          <a
            href="https://metamask.io/download"
            target="_blank"
            rel="noreferrer"
          >
            Install MetaMask →
          </a>
        </div>
      )}

      <div className="browse-controls">
        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          aria-label="Filter auctions by phase"
        >
          <option value="all">All Phases</option>
          <option value="Commit Phase">Commit Phase</option>
          <option value="Reveal Phase">Reveal Phase</option>
          <option value="Awaiting Finalization">
            Awaiting Finalization
          </option>
          <option value="Finalized">Finalized</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort auctions"
        >
          <option value="newest">Newest</option>
          <option value="ending">Ending Soon</option>
        </select>
      </div>

      {filteredAuctions.length === 0 ? (
        <div className="browse-state">
          <h2>No auctions found.</h2>
          <p>
            Try changing the phase filter or check back later.
          </p>
        </div>
      ) : (
        <div className="auction-grid">
          {filteredAuctions.map((auction) => (
            <AuctionCard
              key={auction.auctionAddress}
              auction={auction}
            />
          ))}
        </div>
      )}
    </div>
  );
}