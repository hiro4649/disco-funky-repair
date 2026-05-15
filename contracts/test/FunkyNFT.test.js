const path = require("path");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const hre = require("hardhat");
const { ethers } = hre;

const describeIfNftConfig =
  path.basename(hre.config.paths.sources) === "funky-nft" ? describe : describe.skip;

describeIfNftConfig("FunkyNFT", function () {
  // Mock price feed: $500 per BNB (Chainlink uses 8 decimals)
  const MOCK_BNB_PRICE = 500n * 10n ** 8n;
  const MINT_USD_PRICE = 500n * 10n ** 8n;
  const MINT_PRICE_BNB = ethers.parseEther("1.001");
  const BASE_URI = "ipfs://funky/";
  const MAX_SUPPLY = 5n;

  async function deployFunkyNFTFixture(maxSupply = MAX_SUPPLY) {
    const [owner, user1, user2, royaltyRecipient] = await ethers.getSigners();

    const MockPriceFeed = await ethers.getContractFactory("MockV3Aggregator");
    const priceFeed = await MockPriceFeed.deploy(8, MOCK_BNB_PRICE);

    const FunkyNFT = await ethers.getContractFactory("FunkyNFT");
    const nft = await FunkyNFT.deploy(
      await priceFeed.getAddress(),
      royaltyRecipient.address,
      500,
      maxSupply
    );

    await nft.connect(owner).setBaseURI(BASE_URI);

    return { nft, priceFeed, owner, user1, user2, royaltyRecipient };
  }

  async function enableMint(nft, owner) {
    await nft.connect(owner).setMintEnabled(true);
  }

  describe("Deployment", function () {
    it("sets name, symbol, owner, price, max supply, and disabled mint state", async function () {
      const { nft, owner } = await loadFixture(deployFunkyNFTFixture);

      expect(await nft.name()).to.equal("FUNKY NFT");
      expect(await nft.symbol()).to.equal("FUNKY");
      expect(await nft.owner()).to.equal(owner.address);
      expect(await nft.mintUsdPrice()).to.equal(MINT_USD_PRICE);
      expect(await nft.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
      expect(await nft.mintEnabled()).to.equal(false);
      expect(await nft.nextTokenId()).to.equal(0);
    });

    it("rejects zero max supply", async function () {
      const [, , , royaltyRecipient] = await ethers.getSigners();
      const MockPriceFeed = await ethers.getContractFactory("MockV3Aggregator");
      const priceFeed = await MockPriceFeed.deploy(8, MOCK_BNB_PRICE);
      const FunkyNFT = await ethers.getContractFactory("FunkyNFT");

      await expect(
        FunkyNFT.deploy(await priceFeed.getAddress(), royaltyRecipient.address, 500, 0)
      ).to.be.revertedWith("Max supply must be greater than 0");
    });
  });

  describe("Mint controls", function () {
    it("keeps public mint disabled until owner enables it", async function () {
      const { nft, user1 } = await loadFixture(deployFunkyNFTFixture);

      await expect(nft.connect(user1).mint({ value: MINT_PRICE_BNB })).to.be.revertedWith(
        "Mint is disabled"
      );
    });

    it("allows only owner to manage sale state and base URI", async function () {
      const { nft, owner, user1 } = await loadFixture(deployFunkyNFTFixture);

      await expect(nft.connect(user1).setMintEnabled(true)).to.be.revertedWithCustomError(
        nft,
        "OwnableUnauthorizedAccount"
      );
      await expect(nft.connect(user1).setBaseURI("ipfs://evil/")).to.be.revertedWithCustomError(
        nft,
        "OwnableUnauthorizedAccount"
      );

      await nft.connect(owner).setMintEnabled(true);
      await nft.connect(owner).setBaseURI("ipfs://official/");
      expect(await nft.mintEnabled()).to.equal(true);
    });

    it("does not expose user-controlled tokenURI or public arbitrary recipient mint inputs", async function () {
      const { nft } = await loadFixture(deployFunkyNFTFixture);

      const mintFragment = nft.interface.getFunction("mint");
      const batchFragment = nft.interface.getFunction("batchMint");

      expect(mintFragment.inputs).to.have.length(0);
      expect(batchFragment.inputs.map((input) => input.type)).to.deep.equal([
        "address",
        "uint256",
      ]);
    });

    it("requires a base URI before minting", async function () {
      const { nft, owner, user1 } = await loadFixture(deployFunkyNFTFixture);

      await nft.connect(owner).setBaseURI("ipfs://temporary/");
      await nft.connect(owner).setMintEnabled(true);

      const FunkyNFT = await ethers.getContractFactory("FunkyNFT");
      const MockPriceFeed = await ethers.getContractFactory("MockV3Aggregator");
      const priceFeed = await MockPriceFeed.deploy(8, MOCK_BNB_PRICE);
      const noBaseNft = await FunkyNFT.deploy(
        await priceFeed.getAddress(),
        owner.address,
        500,
        MAX_SUPPLY
      );
      await noBaseNft.connect(owner).setMintEnabled(true);

      await expect(
        noBaseNft.connect(user1).mint({ value: MINT_PRICE_BNB })
      ).to.be.revertedWith("Base URI not set");
    });

    it("mints public NFTs only to msg.sender with contract-managed metadata", async function () {
      const { nft, owner, user1, user2 } = await loadFixture(deployFunkyNFTFixture);
      await enableMint(nft, owner);

      await expect(nft.connect(user1).mint({ value: MINT_PRICE_BNB }))
        .to.emit(nft, "Transfer")
        .withArgs(ethers.ZeroAddress, user1.address, 0);

      await nft.connect(user2).mint({ value: MINT_PRICE_BNB });

      expect(await nft.ownerOf(0)).to.equal(user1.address);
      expect(await nft.ownerOf(1)).to.equal(user2.address);
      expect(await nft.tokenURI(0)).to.equal(`${BASE_URI}0`);
      expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1`);
      expect(await nft.nextTokenId()).to.equal(2);
    });

    it("rejects public mint payments below the minimum", async function () {
      const { nft, owner, user1 } = await loadFixture(deployFunkyNFTFixture);
      await enableMint(nft, owner);

      await expect(
        nft.connect(user1).mint({ value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("Must send at least minimum price in BNB");
    });

    it("enforces MAX_SUPPLY for public mint", async function () {
      const { nft, owner, user1, user2 } = await deployFunkyNFTFixture(2n);
      await enableMint(nft, owner);

      await nft.connect(user1).mint({ value: MINT_PRICE_BNB });
      await nft.connect(user2).mint({ value: MINT_PRICE_BNB });

      await expect(nft.connect(user1).mint({ value: MINT_PRICE_BNB })).to.be.revertedWith(
        "Max supply exceeded"
      );
    });
  });

  describe("Owner batch mint", function () {
    it("allows only owner batch mint without user-supplied tokenURIs", async function () {
      const { nft, owner, user1, user2 } = await loadFixture(deployFunkyNFTFixture);
      await enableMint(nft, owner);

      await expect(
        nft.connect(user1).batchMint(user2.address, 2)
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");

      await nft.connect(owner).batchMint(user2.address, 2);

      expect(await nft.ownerOf(0)).to.equal(user2.address);
      expect(await nft.ownerOf(1)).to.equal(user2.address);
      expect(await nft.tokenURI(0)).to.equal(`${BASE_URI}0`);
      expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1`);
      expect(await nft.nextTokenId()).to.equal(2);
    });

    it("does not allow owner batch mint while mint is disabled", async function () {
      const { nft, owner, user1 } = await loadFixture(deployFunkyNFTFixture);

      await expect(nft.connect(owner).batchMint(user1.address, 1)).to.be.revertedWith(
        "Mint is disabled"
      );
    });

    it("rejects empty batch quantity and max supply overflow", async function () {
      const { nft, owner, user1 } = await deployFunkyNFTFixture(2n);
      await enableMint(nft, owner);

      await expect(nft.connect(owner).batchMint(user1.address, 0)).to.be.revertedWith(
        "Must mint at least 1 NFT"
      );

      await nft.connect(owner).batchMint(user1.address, 2);
      await expect(nft.connect(owner).batchMint(user1.address, 1)).to.be.revertedWith(
        "Max supply exceeded"
      );
    });
  });

  describe("Price Management", function () {
    it("returns correct BNB/USD price and conversion rate", async function () {
      const { nft } = await loadFixture(deployFunkyNFTFixture);
      const oneBNB = ethers.parseEther("1");

      expect(await nft.getPrice()).to.equal(MOCK_BNB_PRICE);
      expect(await nft.getConversionRate(oneBNB)).to.equal(MINT_USD_PRICE);
    });

    it("allows only owner to update mint price", async function () {
      const { nft, owner, user1 } = await loadFixture(deployFunkyNFTFixture);
      const newPrice = 1000n * 10n ** 8n;

      await nft.connect(owner).setMintUsdPrice(newPrice);
      expect(await nft.mintUsdPrice()).to.equal(newPrice);

      await expect(nft.connect(user1).setMintUsdPrice(newPrice)).to.be.revertedWithCustomError(
        nft,
        "OwnableUnauthorizedAccount"
      );
      await expect(nft.connect(owner).setMintUsdPrice(0)).to.be.revertedWith(
        "Price must be greater than 0"
      );
    });
  });

  describe("Royalty (ERC-2981)", function () {
    it("reports correct royalty info and allows owner royalty update", async function () {
      const { nft, owner, user1, royaltyRecipient } = await loadFixture(deployFunkyNFTFixture);
      await enableMint(nft, owner);

      await nft.connect(user1).mint({ value: MINT_PRICE_BNB });

      const salePrice = ethers.parseEther("1");
      const [receiver, amount] = await nft.royaltyInfo(0, salePrice);
      expect(receiver).to.equal(royaltyRecipient.address);
      expect(amount).to.equal((salePrice * 500n) / 10000n);

      await nft.connect(owner).setDefaultRoyalty(user1.address, 1000);
      const [updatedReceiver, updatedAmount] = await nft.royaltyInfo(0, salePrice);
      expect(updatedReceiver).to.equal(user1.address);
      expect(updatedAmount).to.equal((salePrice * 1000n) / 10000n);
    });
  });

  describe("Withdraw", function () {
    it("allows only owner to withdraw collected BNB", async function () {
      const { nft, owner, user1 } = await loadFixture(deployFunkyNFTFixture);
      await enableMint(nft, owner);

      await nft.connect(user1).mint({ value: MINT_PRICE_BNB });
      await nft.connect(user1).mint({ value: MINT_PRICE_BNB });

      expect(await ethers.provider.getBalance(await nft.getAddress())).to.be.greaterThan(0);

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      await nft.connect(owner).withdraw();
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(ownerBalanceAfter).to.be.greaterThan(ownerBalanceBefore);
      expect(await ethers.provider.getBalance(await nft.getAddress())).to.equal(0);

      await expect(nft.connect(user1).withdraw()).to.be.revertedWithCustomError(
        nft,
        "OwnableUnauthorizedAccount"
      );
    });
  });
});
