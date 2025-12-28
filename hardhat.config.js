require("@nomicfoundation/hardhat-toolbox");
require('hardhat-deploy');
require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.28",
  namedAccounts: {
    deployer: 0,
    user1: 0,
    user2: 0,
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY], // 使用环境变量
      chainId: 11155111, // Sepolia 链 ID
      gasPrice: 15000000000, // 15 Gwei
      loggingEnabled: true, // 启用详细日志
      saveDeployments: true, // 保存部署记录
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
