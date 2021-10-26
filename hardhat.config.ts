import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("deploy", "Deploy the contract", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  // Check if there are at least two accounts
  if (accounts.length < 1) {
    console.log("Require at least one account. If you are deploying for testnet or mainnet, please update accounts section in hh config!");
    return;
  }

  // The deployer & token owner are fixed at the first and the second account of the list.
  console.log("ℹ️ Deployment Info:");
  const deployer = accounts[0];
  console.log("\t👤Deployer: ", deployer.address);
  const BECoin = await hre.ethers.getContractFactory("BECoin");
  const bc = await BECoin.deploy();

  console.log("❗️Deploying (it may take time, please do not close the Terminal)...");
  await bc.connect(deployer).deployed();

  console.log(`✅BECoin Token Contract deployed:\n\t👤by: ${await bc.signer.getAddress()} \n\t🏠at: ${bc.address}`);
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    testnet: {
      url: process.env.TESTNET_URL || "",
      accounts:[process.env.DEPLOYER_PRIVATE_KEY || "", process.env.TOKEN_OWNER_PRIVATE_KEY || ""],
    },
    mainnet: {
      url: process.env.MAINNET_URL || "",
      accounts:[process.env.DEPLOYER_PRIVATE_KEY || "", process.env.TOKEN_OWNER_PRIVATE_KEY || ""],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
