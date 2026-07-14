const hre = require("hardhat");

async function main() {
    const [owner] = await hre.ethers.getSigners();

    console.log("Deploying contract with:", owner.address);

    const Auction = await hre.ethers.getContractFactory(
        "VickreyAuction",
        owner
    );

    const commitDuration = 60 * 10;   // 1 hour
    const revealDuration = 60 * 20;   // 1 hour
    const penaltyPercent = 10;        // 10%

    const auction = await Auction.deploy(
        owner,
        commitDuration,
        revealDuration,
        penaltyPercent
    );

    await auction.waitForDeployment();

    console.log("Contract deployed to:");
    console.log(await auction.getAddress());

    console.log("Seller:");
    console.log(await auction.seller());

    console.log("Commit Deadline:");
    console.log(await auction.commitDeadline());

    console.log("Reveal Deadline:");
    console.log(await auction.revealDeadline());

    console.log("Penalty:");
    console.log((await auction.PENALTY_PERCENT()).toString() + "%");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});