# Future Improvements

## Architecture

- [ ] Replace frontend-driven MongoDB updates with blockchain event listeners.
- [ ] Add caching for frequently accessed auctions.
- [ ] Add a reorg-safety buffer (wait N confirmations before writing chain events to Mongo).
- [ ] Idempotent event processing (store last-processed block/tx hash).
- [ ] Rate-limit / retry logic on RPC calls.

## Features

- [ ] Email notifications (reveal reminder, auction finalized, refund available).
- [ ] Auction search and filtering.
- [ ] Image carousel.
- [ ] ERC-20 token support.
- [ ] Replace free-text categories with predefined categories/tags.
- [ ] Build a dedicated bid history UI.
- [ ] Gas estimation preview before commit/reveal/finalize transactions.
- [ ] Multi-auction dashboard for sellers.

## Security / Robustness

- [ ] Rate limiting on backend API routes.
- [ ] Add comprehensive request validation using express-validator/Joi.
- [ ] Slither or Mythril static analysis pass on the Solidity contract.
- [ ] Handle MetaMask lock, network switching, and wallet disconnect gracefully mid-transaction.

## Testing

- [ ] Expand Hardhat/Foundry test suite to cover additional edge cases (tie bids, no-reveal penalty distribution, reserve not met).
- [ ] Frontend integration tests (Cypress/Playwright) for the commit → reveal → finalize flow.

## UI

- [ ] Responsive layout.
- [ ] Dark mode.
- [ ] Replace text loading indicators with skeleton loaders.
- [ ] Countdown timers for commit/reveal deadlines.
- [ ] Replace alert dialogs with toast notifications.

## Deployment & DevOps

- [ ] Deploy frontend (Vercel).
- [ ] Deploy backend (Render/Railway).
- [ ] Verify smart contracts on Etherscan.
- [ ] CI/CD using GitHub Actions.
- [ ] Auction analytics dashboard (total auctions, bids, active auctions).
