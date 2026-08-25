# Vickrey Sealed-Bid Auction

A full-stack decentralized auction platform implementing a **Vickrey (second-price sealed-bid) auction** using a commit-reveal mechanism.

Built with **React, Node.js, Express, MongoDB, Solidity, Hardhat, Ethers.js, and MetaMask**.

---

## Live Demo

**[BidForge](https://vickrey-sealed-bid-auction.vercel.app/)**

> MetaMask is required for blockchain interactions such as bidding, revealing, auction finalization, and withdrawals. Auctions can be browsed without connecting a wallet.

---

## Overview

Traditional online auctions expose bids during the auction, allowing bidders to react to competing offers. This can encourage bid sniping and strategic behavior based on visible competing bids.

This project implements a **sealed-bid Vickrey auction** where bidders:

1. Commit a cryptographic hash of their bid and secret.
2. Wait until the commit phase ends.
3. Reveal the original bid and secret.
4. The highest valid bidder wins.
5. The winner pays the **second-highest valid bid**.

Under the standard assumptions of a Vickrey auction, truthful bidding is a dominant strategy. The commit-reveal mechanism additionally keeps bid values hidden during the bidding phase, preventing participants from seeing and reacting to competing bids before the reveal phase.

The platform combines **on-chain auction logic** with an **off-chain backend**:

- Smart contracts handle bidding, revealing, settlement, deposits, and refunds.
- The backend stores auction metadata, user profiles, bid metadata, images, and documents.
- The frontend provides the interface for interacting with both systems.

---

## Architecture

```text
                         React Frontend
                              │
                     Ethers.js + JWT
                       /            \
                      /              \
             Blockchain              Express API
                 │                       │
             Solidity                 Node.js
             Hardhat                  MongoDB
                 │
              Ethereum
```

The frontend communicates directly with the blockchain through Ethers.js for operations that require trustless execution, including bidding, revealing, finalization, and withdrawals.

The Express API handles off-chain application data such as auction listings, images, documents, bid metadata, and user profiles.

Authentication uses a **wallet-signature challenge**. The backend verifies ownership of the wallet and issues a JWT for subsequent authenticated API requests.

---

## Auction Lifecycle

```text
                 Auction Created
                        │
                        ▼
                ┌───────────────┐
                │  Commit Phase │
                │               │
                │ hash(bid,salt)│
                │    + deposit  │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │  Reveal Phase │
                │               │
                │  bid + salt   │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │    Finalize   │
                └───────┬───────┘
                        │
                        ▼
             Highest valid bidder wins
                        │
                        ▼
            Winner pays second-highest
                   valid bid
                        │
                        ▼
              Losing bidders withdraw
                refundable funds
```

---

## Features

### Smart Contract

- Commit-reveal bidding
- Vickrey second-price auction logic
- Reserve price validation
- Bid deposits
- Lazy refund settlement
- Withdrawal pattern
- Custom Solidity errors
- Contract events
- Auction finalization
- Bid validation during reveal

### Frontend

- Browse auctions
- Auction filtering and sorting
- Auction details
- Auction creation
- My Auctions
- My Bids
- Profile management
- Wallet connection and switching
- Wallet authentication
- Fully responsive layout
- Transaction progress modal
- Authentication modal
- Custom blockchain error handling
- Image gallery
- Document preview and download
- Auction phase tracking

### Backend

- JWT authentication
- Wallet-signature authentication
- Nonce generation
- Wallet verification
- User management
- Auction metadata
- Bid metadata
- Image uploads
- Document uploads

### Testing

- **30 automated test cases passing**
- Unit and integration tests covering the auction lifecycle and contract behavior

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, React Router, Context API, CSS |
| Blockchain | Solidity, Hardhat, Ethers.js, Ethereum |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | MetaMask, JWT |
| File Uploads | Multer |
| Testing | Hardhat, Mocha, Chai |

---

## Screenshots

### Browse Auctions

![Browse Auctions](./screenshots/browse.png)

### Auction Details

![Auction Details](./screenshots/auction-details.png)

### Create Auction

![Create Auction](./screenshots/create-auction.png)

### My Auctions

![My Auctions](./screenshots/my-auctions.png)

### My Bids

![My Bids](./screenshots/my-bids.png)

### Profile

![Profile](./screenshots/profile.png)

### Transaction Flow

![Transaction Flow](./screenshots/transaction-flow.png)

---

## Local Setup

### Clone

```bash
git clone https://github.com/sathviksnayak/vickrey-sealed-bid-auction.git

cd vickrey-sealed-bid-auction
```

### Backend

```bash
cd backend

npm install

npm run dev
```

Create a `.env` file inside `backend/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000
VITE_RPC_URL=your_rpc_url
```

### Smart Contracts

```bash
cd blockchain

npm install

npx hardhat compile
```

To start a local Hardhat network:

```bash
npx hardhat node
```

To deploy to Sepolia:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Make sure the deployed contract addresses and ABI used by the frontend correspond to the current deployment.

---

## Testing

Run the smart contract test suite from the `blockchain/` directory:

```bash
npx hardhat test
```

The project currently has:

**30 passing test cases.**

The tests cover the major auction lifecycle and contract behaviors, including commit, reveal, validation, settlement, and refund-related functionality.

---

## Design Decisions

### Commit-Reveal Protocol

Bidders do not submit their actual bid during the commit phase.

Instead, they submit a cryptographic commitment generated from their bid and a secret salt:

```text
hash(bid, salt)
```

During the reveal phase, the bidder provides the original bid and salt. The smart contract hashes those values again and verifies that the result matches the original commitment.

This keeps bid values hidden while commitments are being submitted.

---

### Vickrey Second-Price Auction

The highest valid revealed bid determines the winner.

However, the winner pays the **second-highest valid bid** rather than their own bid.

Under the standard assumptions of a Vickrey auction, this makes truthful bidding a dominant strategy because bidding above or below one's true valuation does not provide an advantage over bidding truthfully.

---

### Lazy Refund Settlement

The contract does not loop through every losing bidder and send refunds during finalization.

Instead, eligible bidders withdraw their refundable funds themselves.

This avoids expensive batch payouts and prevents the cost of finalization from growing with the number of bidders.

---

### Withdrawal Pattern

Funds are withdrawn by users rather than being pushed to multiple addresses automatically.

This separates auction finalization from individual fund transfers and reduces risks associated with failed external calls and reentrancy.

---

### Wallet-Based Authentication

The backend uses wallet signatures to verify wallet ownership.

The authentication flow is:

```text
Wallet
   │
   │ Request nonce
   ▼
Backend
   │
   │ Return nonce
   ▼
Wallet
   │
   │ Sign nonce
   ▼
Backend
   │
   │ Verify signature
   ▼
JWT issued
```

The user's private key is never sent to the backend.

---

### On-Chain vs Off-Chain Data

Only information requiring blockchain guarantees is stored on-chain.

**On-chain:**

- Bid commitments
- Revealed bids
- Deposits
- Auction state
- Highest bidder
- Highest bid
- Second-highest bid
- Auction finalization
- Refundable funds

**Off-chain:**

- Auction title
- Description
- Images
- Documents
- User profiles
- Bid metadata

Storing large media files and application metadata on-chain would be unnecessarily expensive and impractical. The blockchain therefore handles trust-critical auction logic while MongoDB handles application-level metadata.

---

## Future Improvements

- Event indexing for faster auction history and activity queries
- Advanced auction search and filtering
- Improved wallet synchronization across tabs and network changes
- Additional auction analytics
- More comprehensive transaction history

---

## License

This project is licensed under the MIT License.

See the [LICENSE](./LICENSE) file for details.