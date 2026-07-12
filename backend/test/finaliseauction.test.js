const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");




describe("finalise auction ",function () {

    it("finalise auction and send fund to seller" , async function () {

        const Auction = await ethers.getContractFactory("VickreyAuction");
        const auction = await Auction.deploy(3600, 3600,10);

        const [owner, alice, bob,phil,stacy] = await ethers.getSigners();
        const aliceamount = ethers.parseEther("5");
        const alicesalt = ethers.encodeBytes32String("secret");
        const bobamount = ethers.parseEther("10");
        const bobesalt = ethers.encodeBytes32String("secret1");
        const philamount = ethers.parseEther("3");
        const philsalt = ethers.encodeBytes32String("secret2");
        const stacyamount = ethers.parseEther("7");
        const stacysalt = ethers.encodeBytes32String("secret3");


        await auction.connect(alice).commitBid(
            ethers.solidityPackedKeccak256(
                ["uint256", "bytes32"],
                [aliceamount, alicesalt]
            ),
            {
                value: aliceamount
            }
        );

        await auction.connect(bob).commitBid(
            ethers.solidityPackedKeccak256(
                ["uint256", "bytes32"],
                [bobamount, bobesalt]
            ),
            {
                value: bobamount
            }
        );

        await auction.connect(phil).commitBid(
            ethers.solidityPackedKeccak256(
                ["uint256", "bytes32"],
                [philamount, philsalt]
            ),
            {
                value: philamount
            }
        );

        await auction.connect(stacy).commitBid(
            ethers.solidityPackedKeccak256(
                ["uint256", "bytes32"],
                [stacyamount, stacysalt]
            ),
            {
                value: stacyamount
            }
        );


        await time.increase(3601);

        await auction.connect(alice).revealBid(aliceamount, alicesalt);
        await auction.connect(bob).revealBid(bobamount, bobesalt);
        await auction.connect(phil).revealBid(philamount, philsalt);
        //await auction.connect(stacy).revealBid(stacyamount, stacysalt);

        await expect(
            auction.connect(owner).finalizeAuction()
        ).to.be.revertedWithCustomError(auction, "RevealPhaseNotEnded");

        await time.increase(3601);

        const before = await ethers.provider.getBalance(owner.address);

        await auction.finalizeAuction();

        const after = await ethers.provider.getBalance(owner.address);

        expect(after).to.be.gt(before);


        


        


    });

});