import dotenv from 'dotenv';
dotenv.config();

export const jwt_secret = process.env.JWT_SECRET;

export const adminWalletAddress = process.env.ADMIN_WALLET_ADDRESS;

// EVM / Sepolia configuration
export const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
export const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
export const TOKEN_CONTRACT_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS || '0xe078471F4D5425282567f704a6731D4D42d35233';
export const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
export const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
export const ETHERSCAN_API_URL = process.env.ETHERSCAN_API_URL;

// QuickNode RPC configuration
export const QUICKNODE_HTTP_RPC_URL = process.env.QUICKNODE_HTTP_RPC_URL;
export const QUICKNODE_WS_RPC_URL = process.env.QUICKNODE_WS_RPC_URL;

// NFT.Storage / Lighthouse configuration
export const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY || '';
export const NFT_STORAGE_ENDPOINT = process.env.NFT_STORAGE_ENDPOINT || 'https://gateway.lighthouse.storage/ipfs/';

// Discord webhook configuration
export const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

// Alert system metadata (optional but recommended)
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CHAIN_NAME = process.env.CHAIN_NAME || 'BSC Mainnet';
export const SERVICE_VERSION = process.env.SERVICE_VERSION || 'unknown';