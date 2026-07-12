const { ethers } = require("hardhat");

function hashBid(amount, salt) {
    return ethers.solidityPackedKeccak256(
        ["uint256", "bytes32"],
        [amount, salt]
    );
}

module.exports = { hashBid };