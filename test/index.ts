import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { ethers } from "hardhat";

const deployBeCoin = async () => {
  const BeCoin = await ethers.getContractFactory("BECoin");
  const bc = await BeCoin.deploy();
  return bc.deployed();
}

const token2fraction = (tokens: number) => {
  // beCoin uses 6 decimals
  const factions = BigNumber.from(10).pow(6);
  return BigNumber.from(tokens).mul(factions);
}

describe("beCoin", async function () {
  it("Should have max supply of 1_000_000_000 tokens", async function () {
    let bc = await deployBeCoin();
    
    let oneBillion = token2fraction(1000000000);
    expect(await bc.cap()).to.equal(oneBillion);
  });

  it("Should use 6 decimals", async function () {
    let bc = await deployBeCoin();
    expect(await bc.decimals()).to.equal(6);
  });

  it("Should mint 1M tokens when requested by owner", async function () {
    let bc = await deployBeCoin();
    
    let mintAmount = token2fraction(1000000);
    let owner = await bc.owner();
    await bc.mint(owner, mintAmount);
    
    expect(await bc.totalSupply()).to.equal(mintAmount);
  });

  it("Should not be able to mint by non-owner", async function () {
    let bc = await deployBeCoin();
    let mintAmount = token2fraction(1000000);

    const accounts = await ethers.getSigners();
    let account9 = accounts[9];

    let owner = await bc.owner();
    await expect(bc.connect(account9).mint(owner, mintAmount))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should not be able to supply over 1B tokens", async function () {
    let bc = await deployBeCoin();
    
    let initialMintAmount = token2fraction(1); // 1 token
    await bc.mint(await bc.owner(), initialMintAmount);
    
    let morethan1B = token2fraction(1000000000).add(await bc.totalSupply());
    let owner = await bc.owner();
    
    await expect(bc.mint(owner, morethan1B))
    .to.be.revertedWith("ERC20Capped: cap exceeded");
  });

  it("Should pause transfers", async function () {
    let bc = await deployBeCoin();
    let initialMintAmount = token2fraction(1000); // 1000 tokens
    let owner = await bc.owner();
    await bc.mint(owner, initialMintAmount);

    await bc.pause();

    const accounts = await ethers.getSigners();
    let account1 = accounts[1];

    await expect(bc.transfer(account1.address, token2fraction(100)))
          .to.be.revertedWith("Pausable: paused");
  });

});

