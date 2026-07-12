const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Commit Phase", function () {

    it("should allow a user to commit a bid", async function () {

        const Auction = await ethers.getContractFactory("VickreyAuction");
        const auction = await Auction.deploy(3600, 3600,20);

        const [owner, alice] = await ethers.getSigners();
        const [, bob] = await ethers.getSigners();
        const bidAmount = ethers.parseEther("5");

        const salt = ethers.encodeBytes32String("secret");

        const bidHash = ethers.solidityPackedKeccak256(
            ["uint256", "bytes32"],
            [bidAmount, salt]
        );

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
        ).to.be.revertedWithCustomError(auction, "AlreadyCommitted");

        await time.increase(3601);


      
        await expect(
            auction.connect(bob).commitBid(
                bidHash,
                {
                    value: bidAmount
                }
            )
        ).to.be.revertedWithCustomError(auction, "CommitPhaseEnded");
        

    });

});