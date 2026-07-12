require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-contract-sizer");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
};require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",

  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 20,
  },
      contractSizer: {
        runOnCompile: true,
    },

};