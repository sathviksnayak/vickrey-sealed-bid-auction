const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const { hashBid } = require("./helpers/hashBid");
const { deployAuctionFixture } = require("./helpers/fixtures");

describe("Reveal Phase", function () {

    it("should allow a valid bidder to reveal", async function () {

        const {
            auction,
            alice,
            bob
        } = await loadFixture(deployAuctionFixture);

        const amount = ethers.parseEther("5");
        const salt = ethers.encodeBytes32String("secret");

        const bidHash = hashBid(amount, salt);

        await auction.connect(alice).commitBid(
            bidHash,
            { value: amount }
        );

        await auction.connect(bob).commitBid(
            bidHash,
            { value: amount }
        );

        await time.increase(3601);

        await expect(
            auction.connect(alice).revealBid(
                amount,
                salt
            )
        ).to.emit(auction, "BidRevealed");

        await expect(
            auction.connect(alice).revealBid(
                amount,
                salt
            )
        ).to.be.revertedWithCustomError(
            auction,
            "BidAlreadyRevealed"
        );

        await expect(
            auction.connect(bob).revealBid(
                amount + 1n,
                salt
            )
        ).to.be.revertedWithCustomError(
            auction,
            "InvalidReveal"
        );

    });

});