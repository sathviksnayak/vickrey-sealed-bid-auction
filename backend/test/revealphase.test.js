const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Reveal Phase", function () {

    it("should allow a valid bidder to reveal", async function () {

        const Auction = await ethers.getContractFactory("VickreyAuction");
        const auction = await Auction.deploy(3600, 3600,20);

        const [owner, alice, bob] = await ethers.getSigners();
        const amount = ethers.parseEther("5");
        const salt = ethers.encodeBytes32String("secret");

        const bidHash = ethers.solidityPackedKeccak256(
            ["uint256", "bytes32"],
            [amount, salt]
        );

        await auction.connect(alice).commitBid(
            bidHash,
            {
                value: amount
            }
        );

        await auction.connect(bob).commitBid(
            bidHash,
            {
                value: amount
            }
        );

        await time.increase(3601);

        await expect(
            auction.connect(alice).revealBid(amount, salt)
        ).to.emit(auction, "BidRevealed");


    await expect(
        auction.connect(alice).revealBid(amount, salt)
    ).to.be.revertedWithCustomError(auction, "BidAlreadyRevealed");

   
    await expect(
        auction.connect(bob).revealBid(amount+1n, salt)
    ).to.be.revertedWithCustomError(auction,"InvalidReveal");


    });


});