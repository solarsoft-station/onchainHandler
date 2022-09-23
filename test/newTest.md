const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");

describe("Smart Contracts", async function () {
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

  it("ERC721 mints tokens", async function () {
    const arr = [owner, otherAccount, oOtherAccount];
    for (var i = 0; i < arr.length; i++) {
      await nft1.connect(arr[i]).mint(2);
      await nft2.connect(arr[i]).mint(2);
      await nft3.connect(arr[i]).mint(2);
      // console.log(`${await nft1.connect(arr[i]).balanceOf(arr[i].address)}`);
      // console.log(`${await nft2.connect(arr[i]).balanceOf(arr[i].address)}`);
      // console.log(`${await nft3.connect(arr[i]).balanceOf(arr[i].address)}`);

      expect(await nft1.connect(arr[i]).balanceOf(arr[i].address)).to.equal(2);
      expect(await nft2.connect(arr[i]).balanceOf(arr[i].address)).to.equal(2);
      expect(await nft3.connect(arr[i]).balanceOf(arr[i].address)).to.equal(2);
    }
  });

  it("ERC721 set permissions for handler", async function () {
    await nft1.connect(oOtherAccount).setApprovalForAll(handler.address, true);
    await nft2.connect(otherAccount).setApprovalForAll(handler.address, true);
    await nft3.connect(owner).setApprovalForAll(handler.address, true);

    expect(await nft3.isApprovedForAll(owner.address, handler.address)).to.be
      .true;
    expect(await nft2.isApprovedForAll(otherAccount.address, handler.address))
      .to.be.true;
    expect(await nft1.isApprovedForAll(oOtherAccount.address, handler.address))
      .to.be.true;
  });
  it("Handler moves one token", async function () {
    expect(
      await handler
        .connect(owner)
        .sendOneERC721(owner.address, otherAccount.address, 1, nft1.address)
    ).to.be.true;
    expect(await nft1.connect(owner).balanceOf(otherAccount.address)).to.equal(
      3
    );
    expect(await nft1.connect(owner).balanceOf(owner.address)).to.equal(1);
  });
});
