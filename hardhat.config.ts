import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import { ethers } from "hardhat";
import { formatEther, formatUnits, parseEther } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    let balance = await account.getBalance();
    console.log(`${account.address}\t${formatEther(balance)} ETH`);
  }
});

task("gasInfo", "Estimate gas price", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  let deployerBalance = formatEther(await deployer.getBalance());
  console.log(`${deployer.address}\t ${deployerBalance} ETH`);

  const BECoin = await hre.ethers.getContractFactory("BECoin");
  const bc = await BECoin.deploy();

  let tx = bc.deployTransaction;
  
  let price = tx.gasPrice || BigNumber.from(0);
  if (price) {
    let gasPrice = formatUnits(price, "gwei");
    let gasLimit = tx.gasLimit.toString();
    let estimatedFundNeeded = formatEther(price.mul(tx.gasLimit));
    console.log(`Gas price: ${gasPrice} gwei\nGas limit: ${gasLimit}\nEstimated fund needed: ${estimatedFundNeeded} ETH`);
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
  let tx = bc.deployTransaction;
  
  let price = tx.gasPrice || BigNumber.from(0);
  if (price) {
    console.log(`Gas price: ${formatUnits(price, "gwei")} gwei\nGas limit:${tx.gasLimit.toString()}`);
  }

  console.log("❗️Deploying (it may take time, please do not close the Terminal)...");
  await bc.connect(deployer).deployed();
  let receipt = await tx.wait(tx.confirmations);
  let cost = formatEther(price.mul(receipt.gasUsed));
  console.log(`✅BECoin Token Contract deployed (cost: ${cost} ETH):\n\t👤by: ${await bc.signer.getAddress()} \n\t🏠at: ${bc.address}`);
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 168,
      },
    },
  },
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
    enabled: process.env.REPORT_GAS === "YES",
    currency: "USD",
    coinmarketcap: process.env.CMC_KEY || "",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
