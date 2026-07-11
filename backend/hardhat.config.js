import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

/** @type {import("hardhat/config").HardhatUserConfig} */
export default {
  plugins: [hardhatEthers],

  solidity: {
    version: "0.8.28",
  },
};