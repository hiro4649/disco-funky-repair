export const NFT_ABI = [
    "function mint(address owner, string memory uri) public returns (uint256)",
    "function totalSupply() public view returns (uint256)",
    "function getPrice() public view returns (uint256)",
    "function nextTokenId() external view returns (uint256)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function tokenURI(uint256 tokenId) public view returns (string memory)",
    "function mintUsdPrice() public view returns (uint256)"
];

export const TOKEN_ABI = [
    // Basic ERC-20 functions
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",

    // Fee and holding read functions
    "function feePercent(uint16) view returns (uint16)",
    "function holdingDate(address) view returns (uint16)",
    "function feeRecipient() view returns (address)",

    // Events
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
];
