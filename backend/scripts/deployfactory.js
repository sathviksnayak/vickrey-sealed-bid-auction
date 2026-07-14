const { ethers } = require("hardhat");

async function main() {
    const Factory = await ethers.getContractFactory("AuctionFactory");

    const factory = await Factory.deploy();

    await factory.waitForDeployment();

    console.log("Factory deployed to:", await factory.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});