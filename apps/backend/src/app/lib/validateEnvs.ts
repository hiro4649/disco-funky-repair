import dotenv from 'dotenv';

dotenv.config();

export const PRODUCTION_REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'DATABASE_URL',
  'ADMIN_WALLET_ADDRESS',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'BACKEND_API_URL',
  'FRONTEND_APP_URL',
  'QUICKNODE_HTTP_RPC_URL',
  'QUICKNODE_WS_RPC_URL',
  'CHAIN_ID',
  'TOKEN_CONTRACT_ADDRESS',
  'NFT_CONTRACT_ADDRESS',
  'PRIZE_HOT_WALLET_PRIVATE_KEY',
  'PRIZE_TRANSFER_TOKEN_ALLOWLIST',
  'TIER_RELAYER_PRIVATE_KEY',
  'TIER_UPDATER_CONTRACT_ADDRESS'
] as const;

const ADDRESS_ENV_VARS = new Set([
  'ADMIN_WALLET_ADDRESS',
  'TOKEN_CONTRACT_ADDRESS',
  'NFT_CONTRACT_ADDRESS',
  'TIER_UPDATER_CONTRACT_ADDRESS'
]);

const PRIVATE_KEY_ENV_VARS = new Set([
  'PRIZE_HOT_WALLET_PRIVATE_KEY',
  'TIER_RELAYER_PRIVATE_KEY'
]);

const URL_ENV_VARS = new Set([
  'DATABASE_URL',
  'BACKEND_API_URL',
  'FRONTEND_APP_URL',
  'QUICKNODE_HTTP_RPC_URL',
  'QUICKNODE_WS_RPC_URL'
]);

const PLACEHOLDER_PATTERN = /^(dummy|example|placeholder|changeme|change-me|todo|undefined|null)$/i;
const FORBIDDEN_PUBLIC_SECRET_PATTERN = /^NEXT_PUBLIC_.*(PRIVATE_KEY|SECRET|ADMIN_KEY|OWNER_KEY|RELAYER_KEY|HOT_WALLET|JWT)/i;
const ZERO_ADDRESS = /^0x0{40}$/i;
const ETH_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const PRIVATE_KEY = /^0x[a-fA-F0-9]{64}$/;
const TEST_PRIVATE_KEYS = new Set([
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  '0x59c6995e998f97a5a0044966f0945382df34e9a0551760ab2bdb1a2a2a5d1c77'
]);

type EnvMap = NodeJS.ProcessEnv;

const isBlank = (value: string | undefined): boolean => !value || value.trim() === '';

const isPlaceholderValue = (value: string): boolean => {
  const trimmed = value.trim();
  const normalized = trimmed.toLowerCase();

  return (
    PLACEHOLDER_PATTERN.test(trimmed) ||
    normalized.startsWith('your_') ||
    normalized.startsWith('your-') ||
    normalized.includes('<set') ||
    normalized.includes('replace_me') ||
    normalized.includes('change_me') ||
    normalized.includes('dummy') ||
    normalized.includes('placeholder')
  );
};

const validateUrl = (name: string, value: string): string | null => {
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const protocol = parsed.protocol.toLowerCase();

    if (!['http:', 'https:', 'ws:', 'wss:', 'postgresql:', 'postgres:'].includes(protocol)) {
      return `${name} has an unsupported protocol`;
    }
    if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(hostname)) {
      return `${name} must not point to localhost in production`;
    }
    if (hostname === 'example.com' || hostname.endsWith('.example.com') || hostname.endsWith('.invalid')) {
      return `${name} must not use example or invalid hosts in production`;
    }

    return null;
  } catch {
    return `${name} must be a valid URL`;
  }
};

const validateAddress = (name: string, value: string): string | null => {
  if (!ETH_ADDRESS.test(value)) {
    return `${name} must be a valid EVM address`;
  }
  if (ZERO_ADDRESS.test(value)) {
    return `${name} must not be the zero address`;
  }
  return null;
};

const validatePrivateKey = (name: string, value: string): string | null => {
  const normalized = value.toLowerCase();

  if (!PRIVATE_KEY.test(value)) {
    return `${name} must be a 0x-prefixed 32-byte private key`;
  }
  if (/^0x0{64}$/i.test(value)) {
    return `${name} must not be the zero private key`;
  }
  if (TEST_PRIVATE_KEYS.has(normalized)) {
    return `${name} must not use a known test private key`;
  }
  return null;
};

const validateAllowlist = (value: string): string | null => {
  const addresses = value
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean);

  if (addresses.length === 0) {
    return 'PRIZE_TRANSFER_TOKEN_ALLOWLIST must contain at least one token address';
  }

  const invalid = addresses.find((address) => validateAddress('PRIZE_TRANSFER_TOKEN_ALLOWLIST', address));
  return invalid ? 'PRIZE_TRANSFER_TOKEN_ALLOWLIST contains an invalid token address' : null;
};

export const validateEnvs = (env: EnvMap = process.env): void => {
  if (env.NODE_ENV !== 'production') {
    return;
  }

  const missing: string[] = [];
  const invalid: string[] = [];

  for (const name of PRODUCTION_REQUIRED_ENV_VARS) {
    const value = env[name];
    if (isBlank(value)) {
      missing.push(name);
      continue;
    }

    const trimmed = value!.trim();
    if (isPlaceholderValue(trimmed)) {
      invalid.push(`${name} uses a placeholder value`);
      continue;
    }

    if (URL_ENV_VARS.has(name)) {
      const error = validateUrl(name, trimmed);
      if (error) invalid.push(error);
    }

    if (ADDRESS_ENV_VARS.has(name)) {
      const error = validateAddress(name, trimmed);
      if (error) invalid.push(error);
    }

    if (PRIVATE_KEY_ENV_VARS.has(name)) {
      const error = validatePrivateKey(name, trimmed);
      if (error) invalid.push(error);
    }
  }

  if (env.CHAIN_ID && env.CHAIN_ID.trim() !== '56') {
    invalid.push('CHAIN_ID must be 56 for BSC production');
  }

  if (env.PRIZE_TRANSFER_TOKEN_ALLOWLIST) {
    const error = validateAllowlist(env.PRIZE_TRANSFER_TOKEN_ALLOWLIST);
    if (error) invalid.push(error);
  }

  for (const [name, value] of Object.entries(env)) {
    if (value && FORBIDDEN_PUBLIC_SECRET_PATTERN.test(name)) {
      invalid.push(`${name} must not be exposed with NEXT_PUBLIC_`);
    }
  }

  if (missing.length > 0 || invalid.length > 0) {
    const messages = [
      missing.length > 0 ? `Missing required environment variables: ${missing.join(', ')}` : '',
      invalid.length > 0 ? `Invalid production environment variables: ${invalid.join('; ')}` : ''
    ].filter(Boolean);

    throw new Error(`Invalid production environment. ${messages.join('. ')}`);
  }
};

validateEnvs();
