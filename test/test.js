const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Smart Contract Handler", function () {
  async function deploySet() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, oOtherAccount] = await ethers.getSigners();
    const name = "NFT";
    const symb = "NFT";
    const notRevealedBaseUri = "";
    const baseUri =
      "ipfs://bafybeigu2rbazs4efqjxjw7pi2xrlim77kedf5znkiwdh3by2xz5uf7kyq/";

    const sHandler = await hre.ethers.getContractFactory("ClusterHandler");
    const handler = await sHandler.deploy();

    // now the test nfts
    const NFT1 = await hre.ethers.getContractFactory("NFT1");
    const NFT2 = await hre.ethers.getContractFactory("NFT2");
    const NFT3 = await hre.ethers.getContractFactory("NFT3");

    const nft1 = await NFT1.deploy(name, symb, baseUri, notRevealedBaseUri);
    const nft2 = await NFT2.deploy(name, symb, baseUri, notRevealedBaseUri);
    const nft3 = await NFT3.deploy(name, symb, baseUri, notRevealedBaseUri);

    return {
      handler,
      owner,
      otherAccount,
      oOtherAccount,
      nft1,
      nft2,
      nft3,
    };
  }
  it("Set permissions", async function () {
    const { handler, owner, otherAccount, oOtherAccount, nft1, nft2, nft3 } = await loadFixture(
      deploySet
    );
       await nft1.setApprovalForAll(handler.address, true, {from: oOtherAccount.address})
       await nft2.setApprovalForAll(handler.address, true, {from: otherAccount.address})
       await nft3.setApprovalForAll(handler.address, true, {from: owner.address})


       expect(await nft3.isApprovedForAll(owner.address, handler.address)).to.be.true
       expect(await nft2.isApprovedForAll(otherAccount.address, handler.address)).to.be.true
       expect(await nft1.isApprovedForAll(oOtherAccount.address, handler.address)).to.be.true
  });
});
