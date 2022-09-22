// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  const name = "NFT";
  const symb = "NFT";
  const notRevealedBaseUri = "";
  const baseUri = "ipfs://bafybeigu2rbazs4efqjxjw7pi2xrlim77kedf5znkiwdh3by2xz5uf7kyq/"

  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  // We get the contract to deploy
  const sHandler = await hre.ethers.getContractFactory("ClusterHandler");
  const handler = await sHandler.deploy();

  // now the test nfts
  const NFT1 = await hre.ethers.getContractFactory("NFT1");
  const NFT2 = await hre.ethers.getContractFactory("NFT2");
  const NFT3 = await hre.ethers.getContractFactory("NFT3");


  const nft1 = await NFT1.deploy(name, symb, baseUri, notRevealedBaseUri)
  const nft2 = await NFT2.deploy(name, symb, baseUri, notRevealedBaseUri)
  const nft3 = await NFT3.deploy(name, symb, baseUri, notRevealedBaseUri)


  await handler.deployed();
  await nft1.deployed();
  await nft2.deployed();
  await nft3.deployed();


  console.log("ClusterHandler deployed to:", handler.address);
  console.log("test NFTs deployed to:\n", nft1.address, "\n", nft2.address, "\n", nft3.address)

  // 0xF1C18D9777854254c9FbdAbFDa0c7Ac9F48e65f8- testAlienz on goerli
  // 0xa3935b0eEca9E2A36619C8Ef121F551b17B86279- test on goerli
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
