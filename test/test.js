const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Smart Contracts", function () {
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
    const { owner, otherAccount, oOtherAccount, nft1, nft2, nft3 } =
      await loadFixture(deploySet);
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
    const { handler, owner, otherAccount, oOtherAccount, nft1, nft2, nft3 } =
      await loadFixture(deploySet);
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
    const { handler, owner, otherAccount, nft1 } = await loadFixture(deploySet);

    await nft1.connect(owner).mint(2);
    await nft1.connect(otherAccount).mint(2);
    await nft1.connect(owner).approve(handler.address, 1);
    await handler
      .connect(owner)
      .sendOneERC721(owner.address, otherAccount.address, 1, nft1.address);
    expect(await nft1.connect(owner).balanceOf(otherAccount.address)).to.equal(
      3
    );
  });
  it("Handler moves 2 tokens", async function () {
    const { handler, owner, otherAccount, nft1 } = await loadFixture(deploySet);

    await nft1.connect(owner).mint(2);
    await nft1.connect(otherAccount).mint(2);
    await nft1.connect(owner).setApprovalForAll(handler.address, true);
    await handler
      .connect(owner)
      .sendMultipleTokensOneERC721(
        owner.address,
        otherAccount.address,
        [1, 2],
        nft1.address
      );
    expect(await nft1.connect(owner).balanceOf(otherAccount.address)).to.equal(
      4
    );
  });
  
  it("Handler moves 1 token each from 2 contracts", async function () {
    const { handler, owner, otherAccount, nft1, nft2 } = await loadFixture(deploySet);

    await nft1.connect(owner).mint(2);
    await nft2.connect(owner).mint(2);
    await nft1.connect(owner).setApprovalForAll(handler.address, true);
    await nft2.connect(owner).setApprovalForAll(handler.address, true);
    await handler
      .connect(owner)
      .sendOneTokenMultipleERC721(
        [nft1.address, nft2.address],
        [1, 1],
        owner.address,
        otherAccount.address,
      );
    expect(await nft1.connect(owner).balanceOf(otherAccount.address)).to.equal(
      1
    );
    expect(await nft2.connect(owner).balanceOf(otherAccount.address)).to.equal(
      1
    );
  });
  it("Handler moves tokens from contracts", async function () {
    const { handler, owner, otherAccount, nft1, nft2, nft3 } = await loadFixture(deploySet);

    await nft1.connect(owner).mint(2);
    await nft2.connect(owner).mint(2);
    await nft3.connect(owner).mint(2);
    await nft1.connect(owner).setApprovalForAll(handler.address, true);
    await nft2.connect(owner).setApprovalForAll(handler.address, true);
    await nft3.connect(owner).setApprovalForAll(handler.address, true);
    await handler
      .connect(owner)
      .sendMultipleTokensMultipleERC721(
        [nft1.address, nft2.address, nft3.address],
        [[1], [1, 2], [1]],
        owner.address,
        otherAccount.address,
      );
    expect(await nft1.connect(owner).balanceOf(otherAccount.address)).to.equal(
      1
    );
    expect(await nft2.connect(owner).balanceOf(otherAccount.address)).to.equal(
      2
    );
    expect(await nft3.connect(owner).balanceOf(otherAccount.address)).to.equal(
      1
    );
  });

  //function sendMultipleTokensMultipleERC721(
   // address[] calldata addresses, uint256[][] calldata ids, address owner, address receiver)
});

