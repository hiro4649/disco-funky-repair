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
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transferFrom(address from, address to, uint256 value) returns (bool)",

    // Admin management functions
    "function add_admin(address newAdmin)",
    "function remove_admin(address adminToRemove)",
    "function isAdmin(address) view returns (bool)",

    // DEX management functions
    "function add_dex(address dex)",
    "function remove_dex(address dex)",
    "function isDex(address) view returns (bool)",

    // Fee management functions - Updated for new contract
    "function feePercent(uint16) view returns (uint16)",
    "function holdingDate(address) view returns (uint16)",
    "function feeRecipient() view returns (address)",
    "function update_fee_percentage(uint16 _holdingDate, uint16 _newFeePercent)",
    "function update_holding_date(address user, uint16 _holdingDate)",
    "function update_fee_recipient(address newRecipient)",

    // Events
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    "event AdminAdded(address indexed admin)",
    "event AdminRemoved(address indexed admin)",
    "event DexAdded(address indexed dex)",
    "event DexRemoved(address indexed dex)",
    "event FeePercentageUpdated(uint16 oldFeePercent, uint16 newFeePercent)",
    "event HoldingDateUpdated(address indexed user, uint16 oldHoldingDate, uint16 newHoldingDate)",
    "event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient)"
];