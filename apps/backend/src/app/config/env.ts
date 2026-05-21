import dotenv from 'dotenv';
import { getPrimaryExplorerApiKey } from './explorerApiKeys';
dotenv.config();

const devOnlyFallback = (value: string): string | undefined =>
  process.env.NODE_ENV === 'production' ? undefined : value;

const requiredConfigValue = (name: string, value: string | undefined): string => {
  if (process.env.NODE_ENV === 'production' && !value) {
    throw new Error(`${name} is not configured`);
  }
  return value || '';
};

export const jwt_secret = process.env.JWT_SECRET;

export const adminWalletAddress = process.env.ADMIN_WALLET_ADDRESS;

// EVM / Sepolia configuration
export const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
export const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
export const PRIZE_HOT_WALLET_PRIVATE_KEY = process.env.PRIZE_HOT_WALLET_PRIVATE_KEY;
export const PRIZE_TRANSFER_TOKEN_ALLOWLIST = process.env.PRIZE_TRANSFER_TOKEN_ALLOWLIST || '';
export const TIER_RELAYER_PRIVATE_KEY = process.env.TIER_RELAYER_PRIVATE_KEY;
export const CHAIN_ID = process.env.CHAIN_ID || '';
export const TOKEN_CONTRACT_ADDRESS = requiredConfigValue(
  'TOKEN_CONTRACT_ADDRESS',
  process.env.TOKEN_CONTRACT_ADDRESS || devOnlyFallback('0xe078471F4D5425282567f704a6731D4D42d35233')
);
export const TIER_UPDATER_CONTRACT_ADDRESS = process.env.TIER_UPDATER_CONTRACT_ADDRESS;
export const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
export const ETHERSCAN_API_KEY = getPrimaryExplorerApiKey();
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
