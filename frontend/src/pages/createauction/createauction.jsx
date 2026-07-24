import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { X, Plus } from "lucide-react";
import { createAuction } from "../../services/auctionService";

import { useWallet } from "../../context/WalletContext";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import FactoryABI from "../../abi/AuctionFactory.json";

import TransactionModal from "../../components/transactionmodal/TransactionModal";
import { useTransactionModal } from "../../hooks/useTransactionModal";
import "./createauction.css";
import { validateAuctionForm } from "../../utils/validate/validateAuctionForm";
const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS;
export default function CreateAuction() {

  
  const auth = useAuthGuard();
  const { signer, account } = useWallet();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [commitDuration, setCommitDuration] = useState("");
  const [revealDuration, setRevealDuration] = useState("");
  const [penalty, setPenalty] = useState("");
  const [reservePrice, setreservePrice] = useState("");

  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [errors, setErrors] = useState({});
  const [factory, setFactory] = useState(null);
  const [commitunit, setcommitunit] = useState(Number(60));
  const [revealunit, setrevealunit] = useState(Number(60));

  const [creating, setcreating] = useState(false);

  // Transaction modal state
  const tx = useTransactionModal();

  const CREATE_STEPS = [
    { key: "connecting", label: "Connecting Wallet" },
    { key: "signature", label: "Waiting for Signature..." },
    { key: "pending", label: "Confirming on Blockchain..." },
    { key: "saving", label: "Saving Auction..." },
    { key: "complete", label: "Complete" },
  ];

  useEffect(() => {
    if (!signer) return;

    async function loadFactory() {
      const contract = new ethers.Contract(FACTORY_ADDRESS, FactoryABI, signer);

      setFactory(contract);

      console.log({
  FACTORY_ADDRESS,
  signer,
  contract,
});
    }

    loadFactory();
  }, [signer]);

  function handlecommitunitchange(e) {
    setcommitunit(Number(e.target.value));
    const newval = (commitDuration / commitunit) * Number(e.target.value);

    setCommitDuration(newval);
    
  }

  function handlerevealunitchange(e) {
    setrevealunit(Number(e.target.value));
    const newval = (revealDuration / revealunit) * Number(e.target.value);

    setRevealDuration(newval);
  }

  function handleImageChange(e) {
    const selected = Array.from(e.target.files);
    setImages((prev) => [...prev, ...selected]);
    e.target.value = ""; // allows reselecting from the same/another folder
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDocumentChange(e) {
    const selected = Array.from(e.target.files);
    setDocuments((prev) => [...prev, ...selected]);
    e.target.value = "";
  }

  function removeDocument(index) {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreateAuction() {
    if (creating) return;
    const form = {
      title,
      description,
      category,
      reservePrice,
      penalty,
      commitDuration,
      revealDuration,
    };

    const { valid, errors, values } = validateAuctionForm(form);

    if (!valid) {
      setErrors(errors);
      return;
    }

    setErrors({});

    try {
      if (!(await auth.ensureAuthenticated())) return;
      setcreating(true);
      tx.start("connecting");

      // brief tick so "Connecting Wallet" is visible even though signer already exists
      await new Promise((res) => setTimeout(res, 400));

      tx.goTo("signature");

      const tsx = await factory.createAuction(
        Number(commitDuration),
        Number(revealDuration),
        Number(penalty),
        ethers.parseEther(reservePrice)
      );

      tx.goTo("pending");

      const receipt = await tsx.wait();

      const event = receipt.logs
        .map((log) => {
          try {
            return factory.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((log) => log && log.name === "AuctionCreated");

      const newestAuction = event.args.auction;

      const now = Math.floor(Date.now() / 1000);

      const commitDeadline = now + Number(commitDuration);
      const revealDeadline = commitDeadline + Number(revealDuration);

      tx.goTo("saving");

      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("category", values.category);
      formData.append("commitDeadline", commitDeadline);
      formData.append("revealDeadline", revealDeadline);
      formData.append("penalty", values.penalty);
      formData.append("auctionAddress", newestAuction);

      images.forEach((image) => {
        formData.append("images", image);
      });

      documents.forEach((document) => {
        formData.append("documents", document);
      });

      try {
        await createAuction(formData);
      } catch (saveErr) {
        console.error(saveErr);
        tx.fail("Failed to Save Auction");
        return;
      }

      tx.succeed();

      setTitle("");
      setDescription("");
      setCategory("");
      setCommitDuration("");
      setRevealDuration("");
      setPenalty("");
      setreservePrice("");
      setImages([]);
      setDocuments([]);
      setcommitunit(60);
      setrevealunit(60);
    } catch (err) {
      console.error(err);

      tx.fail(err);
    } finally {
      setcreating(false);
    }
  }

  return (
    <div className="create-auction-page">
      <div className="create-auction-card">
        <h1 className="create-auction-title">Create Auction</h1>

        <div className="form-section">
          <h3 className="section-label">General Information</h3>

          <div className="field-group">
            <label>Auction Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Vintage Playing Cards"
            />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>

          <div className="field-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the item..."
              rows={4}
            />
            {errors.description && (
              <p className="field-error">{errors.description}</p>
            )}
          </div>

          <div className="field-group">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Furniture">Furniture</option>
              <option value="Books">Books</option>
              <option value="Collectibles">Collectibles</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && (
              <p className="field-error">{errors.category}</p>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-label">Auction Configuration</h3>

          <div className="two-col-grid">
            <div className="field-group">
              <label>Reserve Price (ETH)</label>
              <input
                type="number"
                min="0"
                value={reservePrice}
                onChange={(e) => setreservePrice(e.target.value)}
                placeholder="0.01"
              />
              {errors.reservePrice && (
                <p className="field-error">{errors.reservePrice}</p>
              )}
            </div>
            <div className="field-group">
              <label>Penalty (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                onChange={(e) => setPenalty(Number(e.target.value))}
                value={penalty}
                placeholder="10"
              />
              {errors.penalty && (
                <p className="field-error">{errors.penalty}</p>
              )}
            </div>
          </div>

          <div className="two-col-grid">
            <div className="field-group">
              <label>Commit Duration </label>
              <input
                name="commit"
                type="number"
                onChange={(e) =>{
                  setCommitDuration(Number(e.target.value * commitunit))
                

            }
                }
                value={commitDuration / (commitunit)}
                placeholder="30"
              />
              <select value={commitunit} onChange={handlecommitunitchange}>
                <option value="60">min</option>
                <option value="3600">hr</option>
                <option value="86400">days</option>
              </select>
              {errors.commitDuration && (
                <p className="field-error">{errors.commitDuration}</p>
              )}
            </div>

            <div className="field-group">
              <label>Reveal Duration </label>
              <input
                name="reveal"
                type="number"
                onChange={(e) =>{
                  setRevealDuration(Number(e.target.value * revealunit))
                  
                }
                }
                value={revealDuration / (revealunit)}
                placeholder="15"
              />

              <select value={revealunit} onChange={handlerevealunitchange}>
                <option value="60">min</option>
                <option value="3600">hr</option>
                <option value="86400">days</option>
              </select>

              {errors.revealDuration && (
                <p className="field-error">{errors.revealDuration}</p>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-label">Uploads</h3>

          <div className="field-group">
            <label>Images ({images.length})</label>

            <div className="image-preview-grid">
              {images.map((file, index) => (
                <div className="image-preview" key={index}>
                  <img src={URL.createObjectURL(file)} alt={file.name} />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeImage(index)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              <label className="image-add-tile">
                <Plus size={20} />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            </div>
          </div>

          <div className="field-group">
            <label>Documents ({documents.length})</label>

            <label className="upload-button">
              Upload Documents
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleDocumentChange}
                hidden
              />
            </label>

            {documents.length > 0 && (
              <ul className="file-preview-list">
                {documents.map((file, index) => (
                  <li key={index} className="doc-preview-item">
                    <span>📄 {file.name}</span>
                    <button
                      type="button"
                      className="remove-btn-inline"
                      onClick={() => removeDocument(index)}
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <button
          className="submit-button"
          onClick={handleCreateAuction}
          disabled={!factory || creating}
        >
          {creating ? "Creating..." : "Create Auction"}
        </button>
      </div>

      <TransactionModal
        status={tx.status}
        title="Creating Auction"
        steps={CREATE_STEPS}
        currentStep={tx.step}
        successMessage="Auction Created Successfully"
        errorMessage={tx.error}
        onClose={tx.close}
      />

      {auth.modal}
    </div>
  );
}
