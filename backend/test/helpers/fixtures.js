const { ethers } = require("hardhat");

async function deployAuctionFixture() {

    const Auction = await ethers.getContractFactory("VickreyAuction");

    const auction = await Auction.deploy(
        3600,
        3600,
        10
    );

    const [owner, alice, bob, phil, stacy] =
        await ethers.getSigners();

    return {
        auction,
        owner,
        alice,
        bob,
        phil,
        stacy
    };
}

module.exports = {
    deployAuctionFixture
};