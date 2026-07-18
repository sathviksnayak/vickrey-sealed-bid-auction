# Vickrey Sealed Bid Auction

A full-stack decentralized auction platform implementing the Vickrey (second-price sealed-bid) auction protocol.

Built using Solidity, Hardhat, React, Node.js, Express, MongoDB, Ethers.js, and MetaMask.

---

## Overview

Traditional online auctions expose bids immediately, allowing bidders to adjust their offers strategically. This creates incentives for bid sniping, collusion, and inefficient price discovery.

This application implements a sealed-bid Vickrey auction where bidders first submit cryptographic commitments of their bids, reveal them later, and the highest bidder wins while paying the second-highest valid bid. This mechanism removes the incentive to misrepresent a bid, since a bidder's dominant strategy is to bid their true valuation — they can never do better by bidding higher or lower.

The platform combines on-chain auction logic (for trust and settlement guarantees) with an off-chain backend (for metadata, media, and a usable web experience), giving users the security of a smart contract without sacrificing UX.

---

## Architecture

```
                     React Frontend
                            │
                    Ethers.js + JWT
                     /             \
          Smart Contracts      Express API
             Solidity            Node.js
             Hardhat             MongoDB
```

The frontend talks to the blockchain directly via Ethers.js for anything that must be trustless (bidding, revealing, settlement), and to the Express API for anything that doesn't need to live on-chain (auction listings, images, documents, user profiles). JWT-based sessions, issued after a wallet-signature challenge, gate access to the backend.

---

## Features

**Smart Contract**

- Commit-Reveal bidding
- Second-price auction logic
- Reserve price validation
- Lazy refund settlement
- Withdrawal pattern
- Custom Solidity errors
- Events

**Frontend**

- Browse auctions
- Auction details
- Auction creation
- My Auctions
- My Bids
- Profile
- Wallet management
- Responsive layout
- Transaction progress modal
- Authentication modal
- Image gallery
- Document viewer

**Backend**

- JWT Authentication
- Nonce generation
- Wallet verification
- User management
- Auction metadata
- Bid metadata
- Image uploads
- Document uploads

---

## Tech Stack

| Layer          | Technology                                 |
| -------------- | ------------------------------------------ |
| Frontend       | React, React Router, Context API, CSS      |
| Blockchain     | Solidity, Hardhat, OpenZeppelin, Ethers.js |
| Backend        | Node.js, Express.js                        |
| Database       | MongoDB                                    |
| Authentication | MetaMask, JWT                              |
| Storage        | Multer                                     |

---

## Screenshots

**Browse Auctions**
<!-- [screenshot] -->

**Auction Details**
<!-- [screenshot] -->

**Create Auction**
<!-- [screenshot] -->

**Profile**
<!-- [screenshot] -->

**My Auctions**
<!-- [screenshot] -->

**Transaction Flow**
<!-- [screenshot] -->

---

## Local Setup

### Clone

```bash
git clone https://github.com/sathviksnayak/vickrey-sealed-bid-auction.git
cd vickrey-sealed-bid-auction.git

```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Smart Contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat node
npx hardhat run scripts/deploy.js --network sepolia
```

### Environment Variables

Create a `.env` file in `backend/` with:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Create a `.env` file in `frontend/` with:

```
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
REACT_APP_API_URL=http://localhost:5000
```

---

## Design Decisions

- **Commit-Reveal protocol** prevents bid leakage — bidders submit a hash of their bid plus a secret salt during the commit phase, and only disclose the actual value in the reveal phase, so no participant can see or react to another's bid mid-auction.
- **Lazy refund settlement** avoids expensive batch payouts. Instead of the contract looping through every losing bidder to refund them (which scales poorly and risks hitting gas limits), losing bidders withdraw their own funds on demand.
- **Withdrawal pattern over push payments** protects against reentrancy and failed-transfer griefing, following the standard Solidity security practice of letting users pull funds rather than the contract pushing them.
- **JWT authentication is layered on top of wallet signatures** for backend authorization. MetaMask signatures prove wallet ownership without ever exposing a private key, while a short-lived JWT keeps subsequent API calls lightweight and stateless.
- **Auction metadata is stored off-chain while auction logic remains on-chain.** Images, descriptions, and documents are expensive and impractical to store on a blockchain, so only what needs trustless guarantees (bid commitments, reveals, and settlement) lives in the smart contract; everything else lives in MongoDB.

---

## Future Improvements

- Decode Solidity custom errors into human-readable frontend messages
- Event indexing for faster auction history queries
- Advanced filtering and search on the auction browse page
- Responsive design improvements for smaller screens
- Better wallet synchronization across tabs and network changes

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
