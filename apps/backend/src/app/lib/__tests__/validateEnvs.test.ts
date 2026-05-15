import { validateEnvs } from '../validateEnvs';

const TOKEN_ADDRESS = '0x1111111111111111111111111111111111111111';
const NFT_ADDRESS = '0x2222222222222222222222222222222222222222';
const TIER_UPDATER_ADDRESS = '0x3333333333333333333333333333333333333333';

const validProductionEnv = (): NodeJS.ProcessEnv => ({
  NODE_ENV: 'production',
  JWT_SECRET: 'jwt-secret-with-enough-entropy-for-production-tests',
  DATABASE_URL: 'postgresql://funky_db_user:db_password@db.funky.internal:5432/funky',
  ADMIN_WALLET_ADDRESS: '0x4444444444444444444444444444444444444444',
  ADMIN_EMAIL: 'admin@funky.internal',
  ADMIN_PASSWORD: 'FunkyAdminCredentialValue123!',
  BACKEND_API_URL: 'https://api.funky.fan',
  FRONTEND_APP_URL: 'https://funky.fan',
  QUICKNODE_HTTP_RPC_URL: 'https://bsc-mainnet.rpc.provider',
  QUICKNODE_WS_RPC_URL: 'wss://bsc-mainnet.rpc.provider',
  ETHERSCAN_API_URL: 'https://api.etherscan.io/v2/api?chainid=56',
  ETHERSCAN_API_KEY: 'test-etherscan-api-key',
  CHAIN_ID: '56',
  TOKEN_CONTRACT_ADDRESS: TOKEN_ADDRESS,
  NFT_CONTRACT_ADDRESS: NFT_ADDRESS,
  PRIZE_HOT_WALLET_PRIVATE_KEY: `0x${'1'.repeat(64)}`,
  PRIZE_TRANSFER_TOKEN_ALLOWLIST: TOKEN_ADDRESS,
  TIER_RELAYER_PRIVATE_KEY: `0x${'2'.repeat(64)}`,
  TIER_UPDATER_CONTRACT_ADDRESS: TIER_UPDATER_ADDRESS
});

describe('validateEnvs production safety', () => {
  it('fails fast when production required env is missing', () => {
    expect(() => validateEnvs({ NODE_ENV: 'production' })).toThrow(
      /Missing required environment variables: .*JWT_SECRET/
    );
  });

  it('accepts a complete BSC production env shape', () => {
    expect(() => validateEnvs(validProductionEnv())).not.toThrow();
  });

  it('rejects production placeholder private keys', () => {
    const env = {
      ...validProductionEnv(),
      PRIZE_HOT_WALLET_PRIVATE_KEY: 'test-prize-hot-wallet-private-key'
    };

    expect(() => validateEnvs(env)).toThrow(
      /PRIZE_HOT_WALLET_PRIVATE_KEY must be a 0x-prefixed 32-byte private key/
    );
  });

  it('rejects production NEXT_PUBLIC secret exposure', () => {
    const env = {
      ...validProductionEnv(),
      NEXT_PUBLIC_ADMIN_PRIVATE_KEY: `0x${'3'.repeat(64)}`
    };

    expect(() => validateEnvs(env)).toThrow(
      /NEXT_PUBLIC_ADMIN_PRIVATE_KEY must not be exposed with NEXT_PUBLIC_/
    );
  });

  it('does not require production env during development or test', () => {
    expect(() => validateEnvs({ NODE_ENV: 'test' })).not.toThrow();
    expect(() => validateEnvs({ NODE_ENV: 'development' })).not.toThrow();
  });

  it('fails when PRIZE_TRANSFER_TOKEN_ALLOWLIST is missing in production', () => {
    const env = validProductionEnv();
    delete env.PRIZE_TRANSFER_TOKEN_ALLOWLIST;

    expect(() => validateEnvs(env)).toThrow(/PRIZE_TRANSFER_TOKEN_ALLOWLIST/);
  });

  it('fails when TIER_UPDATER_CONTRACT_ADDRESS is missing in production', () => {
    const env = validProductionEnv();
    delete env.TIER_UPDATER_CONTRACT_ADDRESS;

    expect(() => validateEnvs(env)).toThrow(/TIER_UPDATER_CONTRACT_ADDRESS/);
  });

  it('fails when explorer API key env is missing in production', () => {
    const env = validProductionEnv();
    delete env.ETHERSCAN_API_KEY;
    delete env.BSCSCAN_API_KEY;

    expect(() => validateEnvs(env)).toThrow(/ETHERSCAN_API_KEY or BSCSCAN_API_KEY/);
  });

  it('allows BSCSCAN_API_KEY as the production explorer API key', () => {
    const env = validProductionEnv();
    delete env.ETHERSCAN_API_KEY;
    env.BSCSCAN_API_KEY = 'test-bscscan-api-key';

    expect(() => validateEnvs(env)).not.toThrow();
  });

  it('fails when ETHERSCAN_API_URL is missing in production', () => {
    const env = validProductionEnv();
    delete env.ETHERSCAN_API_URL;

    expect(() => validateEnvs(env)).toThrow(/ETHERSCAN_API_URL/);
  });

  it('rejects Ethereum mainnet and testnet explorer endpoints in production', () => {
    expect(() =>
      validateEnvs({
        ...validProductionEnv(),
        ETHERSCAN_API_URL: 'https://api.etherscan.io/api?'
      })
    ).toThrow(/ETHERSCAN_API_URL must use Etherscan V2 with chainid=56/);

    expect(() =>
      validateEnvs({
        ...validProductionEnv(),
        ETHERSCAN_API_URL: 'https://api-testnet.bscscan.com/api?'
      })
    ).toThrow(/ETHERSCAN_API_URL must point to BSC mainnet/);
  });

  it('rejects localhost and non-BSC chainId in production', () => {
    expect(() =>
      validateEnvs({
        ...validProductionEnv(),
        BACKEND_API_URL: 'http://localhost:8000'
      })
    ).toThrow(/BACKEND_API_URL must not point to localhost/);

    expect(() =>
      validateEnvs({
        ...validProductionEnv(),
        CHAIN_ID: '97'
      })
    ).toThrow(/CHAIN_ID must be 56/);
  });
});
