const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const { hashBid } = require("./helpers/hashBid");
const { deployAuctionFixture } = require("./helpers/fixtures");

describe("Commit Phase", function () {

    it("should allow a user to commit a bid", async function () {

        const {
            auction,
            alice,
            bob
        } = await loadFixture(deployAuctionFixture);

        const bidAmount = ethers.parseEther("5");
        const salt = ethers.encodeBytes32String("secret");

        const bidHash = hashBid(bidAmount, salt);

        await expect(
            auction.connect(alice).commitBid(
                bidHash,
                {
                    value: bidAmount
                }
            )
        ).to.emit(auction, "BidCommitted");

        await expect(
            auction.connect(alice).commitBid(
                bidHash,
                {
                    value: bidAmount
                }
            )
        ).to.be.revertedWithCustomError(
            auction,
            "AlreadyCommitted"
        );

        await time.increase(3601);

        await expect(
            auction.connect(bob).commitBid(
                bidHash,
                {
                    value: bidAmount
                }
            )
        ).to.be.revertedWithCustomError(
            auction,
            "CommitPhaseEnded"
        );
    });

});