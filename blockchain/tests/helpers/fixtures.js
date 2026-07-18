const { ethers } = require("hardhat");

async function deployAuctionFixture() {
  const Auction = await ethers.getContractFactory("VickreyAuction");
  const [owner, alice, bob, phil, stacy] = await ethers.getSigners();

  const auction = await Auction.deploy(owner, 3600, 3600, 10);

  return {
    auction,
    owner,
    alice,
    bob,
    phil,
    stacy,
  };
}

module.exports = {
  deployAuctionFixture,
};
