require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    goerli: {
      url: process.env.INFURA_KEY,
      accounts: [process.env.WALLET_PRIVATE_KEY],
    },
  },
};
