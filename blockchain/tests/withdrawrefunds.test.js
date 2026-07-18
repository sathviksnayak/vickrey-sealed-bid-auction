const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { hashBid } = require("./helpers/hashBid");

describe("withdrawrefunds", function () {
  it("withdraw refunds for non winning bidders", async function () {
    const [owner, alice, bob, phil, stacy] = await ethers.getSigners();

    const Auction = await ethers.getContractFactory("VickreyAuction");
    const auction = await Auction.deploy(owner, 3600, 3600, 100);

    const aliceamount = ethers.parseEther("5");
    const alicesalt = ethers.encodeBytes32String("secret");
    const bobamount = ethers.parseEther("10");
    const bobsalt = ethers.encodeBytes32String("secret1");
    const philamount = ethers.parseEther("3");
    const philsalt = ethers.encodeBytes32String("secret2");
    const stacyamount = ethers.parseEther("7");
    const stacysalt = ethers.encodeBytes32String("secret3");

    await auction
      .connect(alice)
      .commitBid(hashBid(aliceamount, alicesalt), { value: aliceamount });

    await auction
      .connect(bob)
      .commitBid(hashBid(bobamount, bobsalt), { value: bobamount });

    await auction
      .connect(phil)
      .commitBid(hashBid(philamount, philsalt), { value: philamount });

    await auction
      .connect(stacy)
      .commitBid(hashBid(stacyamount, stacysalt), { value: stacyamount });

    await time.increase(3601);

    await auction.connect(alice).revealBid(aliceamount, alicesalt);
    await auction.connect(bob).revealBid(bobamount, bobsalt);
    await auction.connect(phil).revealBid(philamount, philsalt);
    //await auction.connect(stacy).revealBid(stacyamount, stacysalt);

    await time.increase(3601);

    await auction.connect(owner).finalizeAuction();

    await expect(auction.connect(alice).withdrawRefund()).to.emit(
      auction,
      "RefundWithdrawn"
    );

    await expect(auction.connect(phil).withdrawRefund()).to.emit(
      auction,
      "RefundWithdrawn"
    );

    await expect(
      auction.connect(stacy).withdrawRefund()
    ).to.be.revertedWithCustomError(auction, "RefundNotAvailable");
  });
});
