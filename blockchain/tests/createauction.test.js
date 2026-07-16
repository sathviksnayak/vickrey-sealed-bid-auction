const { expect } = require("chai");
const { ethers } = require("hardhat");



describe("createauction function", function(){


it("should create a auction",async function(){
const AuctionFactory = await ethers.getContractFactory("AuctionFactory");
const factory = await AuctionFactory.deploy();
 const [owner, alice, bob,phil,stacy] = await ethers.getSigners();

 await expect(
    factory.connect(owner).createAuction( 3600, 3600, 10)
 ).to.emit(factory,"AuctionCreated")

 const auctions = await factory.getAuctions();

expect(auctions.length).to.equal(1);


})

})