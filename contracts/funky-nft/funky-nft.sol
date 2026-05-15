// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract FunkyNFT is ERC721, ERC2981, Ownable {
    uint256 private _nextTokenId;
    AggregatorV3Interface internal priceFeed;
    string private _baseTokenURI;

    uint256 public immutable MAX_SUPPLY;
    bool public mintEnabled;

    // Minimum USD price per NFT (default: $500, Chainlink feed has 8 decimals)
    uint256 public mintUsdPrice = 500 * 10 ** 8;

    constructor(
        address priceFeedAddress,
        address royaltyRecipient,
        uint16 royaltyPercent,
        uint256 maxSupply
    ) ERC721("FUNKY NFT", "FUNKY") Ownable(msg.sender) {
        require(maxSupply > 0, "Max supply must be greater than 0");
        priceFeed = AggregatorV3Interface(priceFeedAddress);
        MAX_SUPPLY = maxSupply;
        _setDefaultRoyalty(royaltyRecipient, royaltyPercent);
    }

    // The following functions are required to resolve inheritance conflicts
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }

    function baseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        require(bytes(newBaseURI).length > 0, "Base URI must not be empty");
        _baseTokenURI = newBaseURI;
    }

    function setMintEnabled(bool enabled) external onlyOwner {
        mintEnabled = enabled;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function _requireMintOpen(uint256 quantity) internal view {
        require(mintEnabled, "Mint is disabled");
        require(bytes(_baseTokenURI).length > 0, "Base URI not set");
        require(_nextTokenId + quantity <= MAX_SUPPLY, "Max supply exceeded");
    }

    /// @notice Mint a single NFT to the caller (must send >= mintUsdPrice in BNB)
    function mint() public payable returns (uint256) {
        _requireMintOpen(1);
        require(
            getConversionRate(msg.value) >= mintUsdPrice,
            "Must send at least minimum price in BNB"
        );

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        return tokenId;
    }

    /// @notice Owner-only batch mint using the contract base URI metadata
    /// @param to The address to mint NFTs to
    /// @param quantity Number of NFTs to mint
    /// @return tokenIds Array of minted token IDs
    function batchMint(
        address to,
        uint256 quantity
    ) external onlyOwner returns (uint256[] memory) {
        require(to != address(0), "Invalid recipient");
        require(quantity > 0, "Must mint at least 1 NFT");
        _requireMintOpen(quantity);

        uint256[] memory tokenIds = new uint256[](quantity);
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(to, tokenId);
            tokenIds[i] = tokenId;
        }

        return tokenIds;
    }

     // Optional: allow updating default royalty later
    function setDefaultRoyalty(address royaltyRecipient, uint16 royaltyPercent) external onlyOwner {
        _setDefaultRoyalty(royaltyRecipient, royaltyPercent);
    }

    /// @notice Fetch latest BNB/USD price (8 decimals)
    function getPrice() public view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    /// @notice Convert BNB (wei) to USD (8 decimals)
    function getConversionRate(
        uint256 bnbAmount
    ) public view returns (uint256) {
        int256 price = getPrice();
        require(price > 0, "Invalid price feed");
        uint256 bnbPrice = uint256(price);

        // (BNB in wei * price) / 1e18
        return (bnbAmount * bnbPrice) / 1e18;
    }

    /// @notice Update minimum price per NFT in USD (only owner)
    function setMintUsdPrice(uint256 newMintUsd) external onlyOwner {
        require(newMintUsd > 0, "Price must be greater than 0");
        mintUsdPrice = newMintUsd;
    }

    /// @notice Withdraw collected BNB (only owner)
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
