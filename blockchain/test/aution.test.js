const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VickreyAuction", function () {
  let VickreyAuction;
  let auction;
  let seller, alice, bob, carol;

  const COMMIT_DURATION = 100; // seconds
  const REVEAL_DURATION = 100;
  const PENALTY_PERCENT = 10n;
  const RESERVE_PRICE = ethers.parseEther("1");

  // helper to generate the same hash the contract expects
  function generateHash(amount, salt) {
    return ethers.solidityPackedKeccak256(["uint256", "bytes32"], [amount, salt]);
  }

  function randomSalt() {
    return ethers.hexlify(ethers.randomBytes(32));
  }

  async function increaseTime(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine");
  }

  beforeEach(async function () {
    [seller, alice, bob, carol] = await ethers.getSigners();

    VickreyAuction = await ethers.getContractFactory("VickreyAuction");
    auction = await VickreyAuction.deploy(
      seller.address,
      COMMIT_DURATION,
      REVEAL_DURATION,
      PENALTY_PERCENT,
      RESERVE_PRICE
    );
    await auction.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set correct initial state", async function () {
      expect(await auction.seller()).to.equal(seller.address);
      expect(await auction.reservePrice()).to.equal(RESERVE_PRICE);
      expect(await auction.highestBid()).to.equal(RESERVE_PRICE);
      expect(await auction.secondHighestBid()).to.equal(RESERVE_PRICE);
      expect(await auction.finalized()).to.equal(false);
    });

    it("should revert on zero commit or reveal duration", async function () {
      await expect(
        VickreyAuction.deploy(seller.address, 0, REVEAL_DURATION, PENALTY_PERCENT, RESERVE_PRICE)
      ).to.be.revertedWithCustomError(VickreyAuction, "InvalidDuration");
    });

    it("should revert on penalty percent > 100", async function () {
      await expect(
        VickreyAuction.deploy(seller.address, COMMIT_DURATION, REVEAL_DURATION, 101n, RESERVE_PRICE)
      ).to.be.revertedWithCustomError(VickreyAuction, "InvalidPenaltyPercent");
    });
  });

  describe("commitBid", function () {
    it("should accept a valid commit", async function () {
      const salt = randomSalt();
      const amount = ethers.parseEther("2");
      const hash = generateHash(amount, salt);

      await expect(auction.connect(alice).commitBid(hash, { value: amount }))
        .to.emit(auction, "BidCommitted")
        .withArgs(alice.address, hash, amount);
    });

    it("should revert on deposit below reserve price", async function () {
      const salt = randomSalt();
      const hash = generateHash(ethers.parseEther("2"), salt);
      const lowDeposit = ethers.parseEther("0.5");

      await expect(
        auction.connect(alice).commitBid(hash, { value: lowDeposit })
      ).to.be.revertedWithCustomError(auction, "InvalidDeposit");
    });

    it("should revert on double commit", async function () {
      const salt = randomSalt();
      const hash = generateHash(ethers.parseEther("2"), salt);

      await auction.connect(alice).commitBid(hash, { value: ethers.parseEther("2") });

      await expect(
        auction.connect(alice).commitBid(hash, { value: ethers.parseEther("2") })
      ).to.be.revertedWithCustomError(auction, "AlreadyCommitted");
    });

    it("should revert if commit phase has ended", async function () {
      const salt = randomSalt();
      const hash = generateHash(ethers.parseEther("2"), salt);

      await increaseTime(COMMIT_DURATION + 1);

      await expect(
        auction.connect(alice).commitBid(hash, { value: ethers.parseEther("2") })
      ).to.be.revertedWithCustomError(auction, "CommitPhaseEnded");
    });
  });

  describe("revealBid", function () {
    it("should revert if commit phase not yet ended", async function () {
      const salt = randomSalt();
      const amount = ethers.parseEther("2");
      const hash = generateHash(amount, salt);

      await auction.connect(alice).commitBid(hash, { value: amount });

      await expect(
        auction.connect(alice).revealBid(amount, salt)
      ).to.be.revertedWithCustomError(auction, "CommitPhaseNotEnded");
    });

    it("should correctly track highest and second-highest bid", async function () {
      const saltA = randomSalt();
      const saltB = randomSalt();
      const amountA = ethers.parseEther("3"); // Alice - highest
      const amountB = ethers.parseEther("2"); // Bob - second highest

      await auction.connect(alice).commitBid(generateHash(amountA, saltA), { value: amountA });
      await auction.connect(bob).commitBid(generateHash(amountB, saltB), { value: amountB });

      await increaseTime(COMMIT_DURATION + 1);

      await expect(auction.connect(alice).revealBid(amountA, saltA))
        .to.emit(auction, "BidRevealed")
        .withArgs(alice.address, amountA);
      await auction.connect(bob).revealBid(amountB, saltB);

      expect(await auction.highestBidder()).to.equal(alice.address);
      expect(await auction.highestBid()).to.equal(amountA);
      expect(await auction.secondHighestBid()).to.equal(amountB);
    });

    it("should revert on wrong salt/amount (invalid reveal)", async function () {
      const salt = randomSalt();
      const wrongSalt = randomSalt();
      const amount = ethers.parseEther("2");

      await auction.connect(alice).commitBid(generateHash(amount, salt), { value: amount });
      await increaseTime(COMMIT_DURATION + 1);

      await expect(
        auction.connect(alice).revealBid(amount, wrongSalt)
      ).to.be.revertedWithCustomError(auction, "InvalidReveal");
    });

    it("should revert on double reveal", async function () {
      const salt = randomSalt();
      const amount = ethers.parseEther("2");

      await auction.connect(alice).commitBid(generateHash(amount, salt), { value: amount });
      await increaseTime(COMMIT_DURATION + 1);
      await auction.connect(alice).revealBid(amount, salt);

      await expect(
        auction.connect(alice).revealBid(amount, salt)
      ).to.be.revertedWithCustomError(auction, "BidAlreadyRevealed");
    });

    it("should revert if reveal phase has ended", async function () {
      const salt = randomSalt();
      const amount = ethers.parseEther("2");

      await auction.connect(alice).commitBid(generateHash(amount, salt), { value: amount });
      await increaseTime(COMMIT_DURATION + REVEAL_DURATION + 1);

      await expect(
        auction.connect(alice).revealBid(amount, salt)
      ).to.be.revertedWithCustomError(auction, "RevealPhaseEnded");
    });

    it("should revert if revealed amount exceeds deposit", async function () {
      const salt = randomSalt();
      const deposit = ethers.parseEther("2");
      const claimedAmount = ethers.parseEther("5"); // lying about a higher bid than deposited

      await auction.connect(alice).commitBid(generateHash(claimedAmount, salt), { value: deposit });
      await increaseTime(COMMIT_DURATION + 1);

      await expect(
        auction.connect(alice).revealBid(claimedAmount, salt)
      ).to.be.revertedWithCustomError(auction, "InsufficientDeposit");
    });
  });

  describe("finalizeAuction", function () {
    it("should revert if reveal phase not ended", async function () {
      await expect(auction.finalizeAuction()).to.be.revertedWithCustomError(
        auction,
        "RevealPhaseNotEnded"
      );
    });

    it("should revert on double finalize", async function () {
      await increaseTime(COMMIT_DURATION + REVEAL_DURATION + 1);
      await auction.finalizeAuction();

      await expect(auction.finalizeAuction()).to.be.revertedWithCustomError(
        auction,
        "AuctionAlreadyFinalized"
      );
    });

    it("should pay seller the second-highest bid when there's a winner", async function () {
      const saltA = randomSalt();
      const saltB = randomSalt();
      const amountA = ethers.parseEther("3");
      const amountB = ethers.parseEther("2");

      await auction.connect(alice).commitBid(generateHash(amountA, saltA), { value: amountA });
      await auction.connect(bob).commitBid(generateHash(amountB, saltB), { value: amountB });
      await increaseTime(COMMIT_DURATION + 1);
      await auction.connect(alice).revealBid(amountA, saltA);
      await auction.connect(bob).revealBid(amountB, saltB);
      await increaseTime(REVEAL_DURATION + 1);

      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
      const tx = await auction.finalizeAuction();
      await tx.wait();
      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);

      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(amountB);
    });

    it("should pay seller nothing if no one reveals (no highest bidder)", async function () {
      const salt = randomSalt();
      const amount = ethers.parseEther("2");

      await auction.connect(alice).commitBid(generateHash(amount, salt), { value: amount });
      // Alice never reveals
      await increaseTime(COMMIT_DURATION + REVEAL_DURATION + 1);

      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
      await auction.finalizeAuction();
      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);

      // No winner => sellerAmount = 0 in finalize (penalty collected later via withdrawRefund)
      expect(sellerBalanceAfter).to.equal(sellerBalanceBefore);
    });
  });

  describe("withdrawRefund", function () {
    it("should revert if auction not finalized", async function () {
      await expect(
        auction.connect(alice).withdrawRefund()
      ).to.be.revertedWithCustomError(auction, "NotFinalised");
    });

    it("should revert if no commitment found", async function () {
      await increaseTime(COMMIT_DURATION + REVEAL_DURATION + 1);
      await auction.finalizeAuction();

      await expect(
        auction.connect(carol).withdrawRefund()
      ).to.be.revertedWithCustomError(auction, "NoCommitmentFound");
    });

    it("winner should receive deposit minus second-highest bid", async function () {
      const saltA = randomSalt();
      const saltB = randomSalt();
      const amountA = ethers.parseEther("3");
      const amountB = ethers.parseEther("2");
      const depositA = ethers.parseEther("4"); // deposited more than bid

      await auction.connect(alice).commitBid(generateHash(amountA, saltA), { value: depositA });
      await auction.connect(bob).commitBid(generateHash(amountB, saltB), { value: amountB });
      await increaseTime(COMMIT_DURATION + 1);
      await auction.connect(alice).revealBid(amountA, saltA);
      await auction.connect(bob).revealBid(amountB, saltB);
      await increaseTime(REVEAL_DURATION + 1);
      await auction.finalizeAuction();

      const expectedRefund = depositA - amountB; // deposit - secondHighestBid

      await expect(auction.connect(alice).withdrawRefund())
        .to.emit(auction, "RefundWithdrawn")
        .withArgs(alice.address, expectedRefund);
    });

    it("losing bidder should get full refund", async function () {
      const saltA = randomSalt();
      const saltB = randomSalt();
      const amountA = ethers.parseEther("3");
      const amountB = ethers.parseEther("2");

      await auction.connect(alice).commitBid(generateHash(amountA, saltA), { value: amountA });
      await auction.connect(bob).commitBid(generateHash(amountB, saltB), { value: amountB });
      await increaseTime(COMMIT_DURATION + 1);
      await auction.connect(alice).revealBid(amountA, saltA);
      await auction.connect(bob).revealBid(amountB, saltB);
      await increaseTime(REVEAL_DURATION + 1);
      await auction.finalizeAuction();

      await expect(auction.connect(bob).withdrawRefund())
        .to.emit(auction, "RefundWithdrawn")
        .withArgs(bob.address, amountB);
    });

    it("non-revealing bidder should get deposit minus penalty; seller gets the penalty", async function () {
      const salt = randomSalt();
      const amount = ethers.parseEther("2");
      const deposit = ethers.parseEther("2");

      await auction.connect(alice).commitBid(generateHash(amount, salt), { value: deposit });
      // Alice never reveals
      await increaseTime(COMMIT_DURATION + REVEAL_DURATION + 1);
      await auction.finalizeAuction();

      const expectedPenalty = (deposit * PENALTY_PERCENT) / 100n;
      const expectedPayout = deposit - expectedPenalty;

      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      await expect(auction.connect(alice).withdrawRefund())
        .to.emit(auction, "RefundWithdrawn")
        .withArgs(alice.address, expectedPayout);

      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(expectedPenalty);
    });

    it("should revert on double withdrawal", async function () {
      const salt = randomSalt();
      const amount = ethers.parseEther("2");

      await auction.connect(alice).commitBid(generateHash(amount, salt), { value: amount });
      await increaseTime(COMMIT_DURATION + 1);
      await auction.connect(alice).revealBid(amount, salt);
      await increaseTime(REVEAL_DURATION + 1);
      await auction.finalizeAuction();

      await auction.connect(alice).withdrawRefund();

      await expect(
        auction.connect(alice).withdrawRefund()
      ).to.be.revertedWithCustomError(auction, "AlreadyRefunded");
    });
  });

  describe("Full end-to-end flow (three bidders, one non-revealer)", function () {
    it("should settle correctly across all parties", async function () {
      const saltA = randomSalt();
      const saltB = randomSalt();
      const saltC = randomSalt();

      const amountA = ethers.parseEther("5"); // Alice - highest, reveals
      const amountB = ethers.parseEther("3"); // Bob - second highest, reveals
      const depositC = ethers.parseEther("2"); // Carol - commits, never reveals

      await auction.connect(alice).commitBid(generateHash(amountA, saltA), { value: amountA });
      await auction.connect(bob).commitBid(generateHash(amountB, saltB), { value: amountB });
      await auction.connect(carol).commitBid(generateHash(ethers.parseEther("2"), saltC), {
        value: depositC,
      });

      await increaseTime(COMMIT_DURATION + 1);
      await auction.connect(alice).revealBid(amountA, saltA);
      await auction.connect(bob).revealBid(amountB, saltB);
      // Carol never reveals

      await increaseTime(REVEAL_DURATION + 1);

      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
      await auction.finalizeAuction();

      // Alice wins, pays amountB (second highest)
      await expect(auction.connect(alice).withdrawRefund())
        .to.emit(auction, "RefundWithdrawn")
        .withArgs(alice.address, amountA - amountB);

      // Bob loses, full refund
      await expect(auction.connect(bob).withdrawRefund())
        .to.emit(auction, "RefundWithdrawn")
        .withArgs(bob.address, amountB);

      // Carol penalized for not revealing
      const carolPenalty = (depositC * PENALTY_PERCENT) / 100n;
      await expect(auction.connect(carol).withdrawRefund())
        .to.emit(auction, "RefundWithdrawn")
        .withArgs(carol.address, depositC - carolPenalty);

      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      // seller got amountB at finalize + carol's penalty at her withdrawal
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(amountB + carolPenalty);
    });
  });
});