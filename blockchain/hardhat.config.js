require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 20,
  },

  contractSizer: {
    runOnCompile: true,
  },

  networks: {
    sepolia: {
      url: process.env.RPC_URL,
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [],
    },
  },
};