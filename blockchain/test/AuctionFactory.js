// --- NEW FILE: test/AuctionFactory.js ---

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuctionFactory", function () {
  let factory, seller, other;

  beforeEach(async function () {
    [seller, other] = await ethers.getSigners();
    const AuctionFactory = await ethers.getContractFactory("AuctionFactory");
    factory = await AuctionFactory.deploy();
    await factory.waitForDeployment();
  });

  it("should start with zero auctions", async function () {
    expect(await factory.getAuctions()).to.deep.equal([]);
  });

  it("should create an auction and emit AuctionCreated", async function () {
    const tx = await factory
      .connect(seller)
      .createAuction(100, 100, 10, ethers.parseEther("1"));
    const receipt = await tx.wait();

    const event = receipt.logs
      .map((log) => {
        try {
          return factory.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e) => e?.name === "AuctionCreated");

    expect(event).to.not.be.undefined;
    expect(event.args.seller).to.equal(seller.address);
    expect(event.args.auction).to.properAddress;
  });

  it("should append the new auction address to getAuctions()", async function () {
    await factory
      .connect(seller)
      .createAuction(100, 100, 10, ethers.parseEther("1"));

    const auctions = await factory.getAuctions();
    expect(auctions.length).to.equal(1);
  });

  it("should track multiple auctions from different sellers independently", async function () {
    await factory
      .connect(seller)
      .createAuction(100, 100, 10, ethers.parseEther("1"));
    await factory
      .connect(other)
      .createAuction(200, 200, 20, ethers.parseEther("2"));

    const auctions = await factory.getAuctions();
    expect(auctions.length).to.equal(2);
    expect(auctions[0]).to.not.equal(auctions[1]);
  });

  it("should deploy each auction with correct constructor params", async function () {
    await factory
      .connect(seller)
      .createAuction(150, 250, 15, ethers.parseEther("0.5"));

    const [auctionAddress] = await factory.getAuctions();
    const auction = await ethers.getContractAt("VickreyAuction", auctionAddress);

    expect(await auction.seller()).to.equal(seller.address);
    expect(await auction.reservePrice()).to.equal(ethers.parseEther("0.5"));
    expect(await auction.PENALTY_PERCENT()).to.equal(15n);
  });

  it("should propagate a revert from the child contract's constructor", async function () {
    await expect(
      factory.connect(seller).createAuction(0, 100, 10, ethers.parseEther("1"))
    ).to.be.reverted; // InvalidDuration bubbles up through the factory call
  });
});