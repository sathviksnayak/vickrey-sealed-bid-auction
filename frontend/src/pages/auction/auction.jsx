import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ethers } from "ethers";
import { ArrowLeft } from "lucide-react";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import ABI from "../../abi/VickreyAuction.json";
import { hashBid } from "../../utils/hashBid";
import { getAuction } from "../../services/auctionService";
import { createBid, updateBid } from "../../services/bidService";
import { useWallet } from "../../context/WalletContext";
import { getAuctionChainData } from "../../services/blockchainService";

import { useTransactionModal } from "../../hooks/useTransactionModal";
import TransactionModal from "../../components/transactionmodal/TransactionModal";
import Tooltip from "../../components/tooltip/Tooltip";
import ImageGallery from "../../components/imagegallery/ImageGallery";
import DocumentCard from "../../components/documentcard/DocumentCard";

import "./auction.css";

const statusConfig = {
    "Commit Phase": { dot: "🟢", className: "commit-phase" },
    "Reveal Phase": { dot: "🟠", className: "reveal-phase" },
    "Finalized": { dot: "⚫", className: "finalized" },
    "Awaiting Finalization": { dot: "🔵", className: "awaiting-finalization" },
};

export default function Auction() {

    const auth=useAuthGuard();
    const { address } = useParams();
    const { account } = useWallet();

    const [auction, setAuction] = useState(null);
    const [bidAmount, setBidAmount] = useState("");
    const [salt, setSalt] = useState("");
    const [contract, setContract] = useState(null);

    const tx = useTransactionModal();
    const [modalMeta, setModalMeta] = useState({ title: "", steps: [], successMessage: "" });

    async function loadAuction() {
        let auctionContract = contract;

        if (!auctionContract) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            auctionContract = new ethers.Contract(address, ABI, signer);
            setContract(auctionContract);
        }

        const [metadata, chainData] = await Promise.all([
            getAuction(address),
            getAuctionChainData(address, auctionContract.runner),
        ]);

        setAuction({
            ...metadata,
            ...chainData,
            status: getStatus(chainData.commitDeadline, chainData.revealDeadline, chainData.finalized),
        });
    }

    useEffect(() => {
        loadAuction();
    }, [address, contract]);

    function getStatus(commitDeadline, revealDeadline, finalized) {
        const now = Math.floor(Date.now() / 1000);
        if (finalized) return "Finalized";
        if (now < commitDeadline) return "Commit Phase";
        if (now < revealDeadline) return "Reveal Phase";
        return "Awaiting Finalization";
    }

    useEffect(() => {
        if (!auction) return;

        const interval = setInterval(() => {
            setAuction((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    status: getStatus(prev.commitDeadline, prev.revealDeadline, prev.finalized),
                };
            });
        }, 30000);

        return () => clearInterval(interval);
    }, [auction?.commitDeadline, auction?.revealDeadline]);

    // ---------- Commit ----------
    async function handleCommit() {
        if (!bidAmount || !salt) {
            alert("Please enter both bid amount and secret.");
            return;
        }

        const amount = ethers.parseEther(bidAmount);

        if (amount < auction.reservePrice) {
            alert("Bid must be at least the reserve price.");
            return;
        }

        setModalMeta({
            title: "Submitting Bid",
            steps: [
                { key: "connecting", label: "Connecting Wallet" },
                { key: "signature", label: "Waiting for Signature..." },
                { key: "pending", label: "Confirming Transaction..." },
                { key: "saving", label: "Recording Bid..." },
                { key: "complete", label: "Complete" },
            ],
            successMessage: "Bid Submitted Successfully",
        });

        try {
            if (!(await auth.ensureAuthenticated())) return;
            tx.start("connecting");
            await new Promise((res) => setTimeout(res, 300));
            tx.goTo("signature");

            const bidHash = hashBid(amount, salt);
            const txResult = await contract.commitBid(bidHash, { value: amount });

            tx.goTo("pending");
            await txResult.wait();

            tx.goTo("saving");
            const now = new Date();
            await createBid({
                auctionAddress: address,
                bidderWallet: account,
                revealed: false,
                committedAt: now,
                revealedAt: null,
            });

            await loadAuction();
            tx.succeed();
        } catch (err) {
            console.error(err);
            tx.fail(err
            );
        }
    }

    // ---------- Reveal ----------
    async function handleReveal() {
        if (!bidAmount || !salt) {
            alert("Please enter both bid amount and secret.");
            return;
        }

        setModalMeta({
            title: "Revealing Bid",
            steps: [
                { key: "connecting", label: "Connecting Wallet" },
                { key: "signature", label: "Waiting for Signature..." },
                { key: "pending", label: "Confirming Reveal..." },
                { key: "saving", label: "Updating Bid..." },
                { key: "complete", label: "Complete" },
            ],
            successMessage: "Bid Revealed Successfully",
        });

        try {
            if (!(await auth.ensureAuthenticated())) return;
            tx.start("connecting");
            await new Promise((res) => setTimeout(res, 300));
            tx.goTo("signature");

            const amount = ethers.parseEther(bidAmount);
            const saltBytes = ethers.encodeBytes32String(salt);

            const txResult = await contract.revealBid(amount, saltBytes);

            tx.goTo("pending");
            await txResult.wait();

            tx.goTo("saving");
            await updateBid(address, {
                bidderWallet: account,
                revealed: true,
                revealedAt: new Date(),
            });

            await loadAuction();
            tx.succeed();
        } catch (err) {
            console.error(err);
            tx.fail(
err
            );
        }
    }

    // ---------- Finalize ----------
    async function handleFinalize() {
        setModalMeta({
            title: "Finalizing Auction",
            steps: [
                { key: "connecting", label: "Connecting Wallet" },
                { key: "signature", label: "Waiting for Signature..." },
                { key: "pending", label: "Confirming Transaction..." },
                { key: "complete", label: "Complete" },
            ],
            successMessage: "Auction Finalized Successfully",
        });

        try {
            if (!(await auth.ensureAuthenticated())) return;
            tx.start("connecting");
            await new Promise((res) => setTimeout(res, 300));
            tx.goTo("signature");

            const txResult = await contract.finalizeAuction();

            tx.goTo("pending");
            await txResult.wait();

            await loadAuction();
            tx.succeed();
        } catch (err) {
            console.error(err);
            tx.fail(
                err.code === "ACTION_REJECTED"
                    ? "Transaction Rejected"
                    : err.shortMessage || err.reason || "Finalization Failed"
            );
        }
    }

    // ---------- Withdraw ----------
    async function handleWithdraw() {
        setModalMeta({
            title: "Withdrawing Funds",
            steps: [
                { key: "connecting", label: "Connecting Wallet" },
                { key: "signature", label: "Waiting for Signature..." },
                { key: "pending", label: "Confirming Transaction..." },
                { key: "complete", label: "Complete" },
            ],
            successMessage: "Funds Withdrawn Successfully",
        });

        try {
            if (!(await auth.ensureAuthenticated())) return;
            tx.start("connecting");
            await new Promise((res) => setTimeout(res, 300));
            tx.goTo("signature");

            const txResult = await contract.withdrawRefund();

            tx.goTo("pending");
            await txResult.wait();

            await loadAuction();
            tx.succeed();
        } catch (err) {
            console.error(err);
            tx.fail(
err
            );
        }
    }

    if (!auction) return <div className="auction-loading">Loading...</div>;

    const { dot, className } = statusConfig[auction.status];
    const isSeller = account && auction.seller?.toLowerCase() === account.toLowerCase();

    const isCommitPhase = auction.status === "Commit Phase";
    const isRevealPhase = auction.status === "Reveal Phase";
    const isAwaitingFinalization = auction.status === "Awaiting Finalization";
    const isFinalized = auction.status === "Finalized";

    const actions = [
        {
            key: "commit",
            label: "Commit Bid",
            enabled: isCommitPhase && !isSeller,
            reason: isSeller
                ? "Sellers cannot bid on their own auction."
                : !isCommitPhase
                ? "Commit phase is not currently active."
                : null,
            onClick: handleCommit,
            needsInputs: true,
        },
        {
            key: "reveal",
            label: "Reveal Bid",
            enabled: isRevealPhase,
            reason: !isRevealPhase
                ? isCommitPhase
                    ? "Reveal phase has not started yet."
                    : "Reveal phase has ended."
                : null,
            onClick: handleReveal,
            needsInputs: true,
        },
        {
            key: "finalize",
            label: "Finalize Auction",
            enabled: isAwaitingFinalization,
            reason: !isAwaitingFinalization
                ? isFinalized
                    ? "This auction has already been finalized."
                    : "Auction cannot be finalized yet."
                : null,
            onClick: handleFinalize,
        },
        {
            key: "withdraw",
            label: "Withdraw Funds",
            enabled: isFinalized,
            reason: !isFinalized ? "Withdrawals become available once the auction is finalized." : null,
            onClick: handleWithdraw,
        },
    ];

    return (
        <div className="auction-page">

            <div className="auction-topbar">
                <Link to="/" className="back-link">
                    <ArrowLeft size={16} /> Back
                </Link>

                <span className={`status ${className}`}>
                    {dot} {auction.status}
                </span>
            </div>

            <ImageGallery images={auction.images} />

            <div className="auction-summary">
                <h1>{auction.title}</h1>
                <p className="auction-category">{auction.category?.toUpperCase()}</p>
                <p className="auction-description">{auction.description}</p>
            </div>

            <section className="auction-section">
                <h3 className="section-title">
                    Auction Information
                    <Tooltip text="Core parameters set by the seller when this auction was created." />
                </h3>

                <div className="info-grid">
                    <div className="info-row">
                        <span>
                            Seller
                            <Tooltip text="Ethereum address that created this auction." />
                        </span>
                        <strong>
                            {auction.seller.slice(0, 6)}...{auction.seller.slice(-4)}
                        </strong>
                    </div>

                    <div className="info-row">
                        <span>
                            Reserve Price
                            <Tooltip text="Minimum acceptable selling price set by the seller. If no valid bid meets this amount, the auction ends without a winner." />
                        </span>
                        <strong>{ethers.formatEther(auction.reservePrice)} ETH</strong>
                    </div>

                    <div className="info-row">
                        <span>
                            Penalty
                            <Tooltip text="Percentage of your deposit forfeited if you fail to reveal your committed bid before the reveal deadline." />
                        </span>
                        <strong>{auction.penalty}%</strong>
                    </div>

                    <div className="info-row">
                        <span>
                            Commit Ends
                            <Tooltip text="During this phase bidders submit only a cryptographic commitment. Bid values remain hidden." />
                        </span>
                        <strong>{new Date(auction.commitDeadline * 1000).toLocaleString()}</strong>
                    </div>

                    <div className="info-row">
                        <span>
                            Reveal Ends
                            <Tooltip text="Bidders reveal their original bid and secret. Invalid or missing reveals are ignored." />
                        </span>
                        <strong>{new Date(auction.revealDeadline * 1000).toLocaleString()}</strong>
                    </div>
                </div>
            </section>

            {auction.finalized && (
                <section className="auction-section">
                    <h3 className="section-title">
                        Auction Results
                        <Tooltip text="Current stage of the auction lifecycle." />
                    </h3>

                    <div className="info-grid">
                        <div className="info-row">
                            <span>
                                Highest Bid
                                <Tooltip text="Highest valid revealed bid." />
                            </span>
                            <strong>{ethers.formatEther(BigInt(auction.highestBid))} ETH</strong>
                        </div>

                        <div className="info-row">
                            <span>
                                Second Highest Bid
                                <Tooltip text="Price paid by the winner under the Vickrey auction mechanism." />
                            </span>
                            <strong>{ethers.formatEther(BigInt(auction.secondHighestBid))} ETH</strong>
                        </div>

                        <div className="info-row">
                            <span>Winner</span>
                            <strong>
                                {auction.highestBidder === ethers.ZeroAddress
                                    ? "No winner"
                                    : `${auction.highestBidder.slice(0, 6)}...${auction.highestBidder.slice(-4)}`}
                            </strong>
                        </div>

                        <div className="info-row">
                            <span>Status</span>
                            <strong>Finalized</strong>
                        </div>
                    </div>
                </section>
            )}

            {auction.documents?.length > 0 && (
                <section className="auction-section">
                    <h3 className="section-title">
                        Documents
                        <Tooltip text="Additional files supplied by the seller such as certificates, invoices, manuals or proof of authenticity." />
                    </h3>

                    <div className="documents-list">
                        {auction.documents.map((doc, i) => (
                            <DocumentCard key={i} document={doc} />
                        ))}
                    </div>
                </section>
            )}

            <section className="auction-section">
                <h3 className="section-title">Actions</h3>

                {(isCommitPhase || isRevealPhase) && (
                    <div className="bid-inputs">
                        <input
                            type="number"
                            placeholder="Bid Amount (ETH)"
                            min={ethers.formatEther(auction.reservePrice)}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Secret"
                            value={salt}
                            onChange={(e) => setSalt(e.target.value)}
                        />
                    </div>
                )}

                <div className="actions-list">
                    {actions.map((action) => (
                        <div key={action.key} className="action-item">
                            <button
                                className="action-button"
                                disabled={!contract || !action.enabled}
                                onClick={action.onClick}
                            >
                                {action.label}
                            </button>
                            {!action.enabled && action.reason && (
                                <span className="action-reason">{action.reason}</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <TransactionModal
                status={tx.status}
                title={modalMeta.title}
                steps={modalMeta.steps}
                currentStep={tx.step}
                successMessage={modalMeta.successMessage}
                errorMessage={tx.error}
                onClose={tx.close}
            />
            {auth.modal}

        </div>
    );
}