#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const STATUS = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  PENDING: 'PENDING',
  NOT_RUN: 'NOT_RUN'
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');

const backendRequiredEnv = [
  'JWT_SECRET',
  'SESSION_SECRET',
  'DATABASE_URL',
  'ADMIN_WALLET_ADDRESS',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'BACKEND_CORS_ORIGINS',
  'BACKEND_API_URL',
  'FRONTEND_APP_URL',
  'QUICKNODE_HTTP_RPC_URL',
  'QUICKNODE_WS_RPC_URL',
  'ETHERSCAN_API_URL',
  'CHAIN_ID',
  'TOKEN_CONTRACT_ADDRESS',
  'NFT_CONTRACT_ADDRESS',
  'PRIZE_HOT_WALLET_PRIVATE_KEY',
  'PRIZE_TRANSFER_TOKEN_ALLOWLIST',
  'TIER_RELAYER_PRIVATE_KEY',
  'TIER_UPDATER_CONTRACT_ADDRESS'
];

const frontendRequiredPublicEnv = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_RPC_URL',
  'NEXT_PUBLIC_TOKEN_ADDRESS',
  'NEXT_PUBLIC_NFT_ADDRESS'
];

const optionalPublicEnv = [
  'NEXT_PUBLIC_ALCHEMY_RPC_URL',
  'NEXT_PUBLIC_SOCKET_API_URL',
  'NEXT_PUBLIC_ETHERSCAN_EXPLORER'
];

const addressEnv = new Set([
  'ADMIN_WALLET_ADDRESS',
  'TOKEN_CONTRACT_ADDRESS',
  'NFT_CONTRACT_ADDRESS',
  'TIER_UPDATER_CONTRACT_ADDRESS',
  'NEXT_PUBLIC_TOKEN_ADDRESS',
  'NEXT_PUBLIC_NFT_ADDRESS'
]);

const privateKeyEnv = new Set(['PRIZE_HOT_WALLET_PRIVATE_KEY', 'TIER_RELAYER_PRIVATE_KEY']);
const urlEnv = new Set([
  'DATABASE_URL',
  'BACKEND_API_URL',
  'FRONTEND_APP_URL',
  'QUICKNODE_HTTP_RPC_URL',
  'QUICKNODE_WS_RPC_URL',
  'ETHERSCAN_API_URL',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_RPC_URL',
  'NEXT_PUBLIC_ALCHEMY_RPC_URL',
  'NEXT_PUBLIC_SOCKET_API_URL',
  'NEXT_PUBLIC_ETHERSCAN_EXPLORER'
]);

const explorerKeyEnv = ['ETHERSCAN_API_KEY', 'BSCSCAN_API_KEY'];
const placeholderPattern = /^(dummy|example|placeholder|changeme|change-me|todo|undefined|null)$/i;
const forbiddenPublicSecretPattern =
  /^NEXT_PUBLIC_.*(PRIVATE_KEY|SECRET|ADMIN_KEY|OWNER_KEY|RELAYER_KEY|HOT_WALLET|JWT)/i;
const evmAddressPattern = /^0x[a-fA-F0-9]{40}$/;
const zeroAddressPattern = /^0x0{40}$/i;
const privateKeyPattern = /^0x[a-fA-F0-9]{64}$/;
const zeroPrivateKeyPattern = /^0x0{64}$/i;
const knownTestPrivateKeys = new Set([
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  '0x59c6995e998f97a5a0044966f0945382df34e9a0551760ab2bdb1a2a2a5d1c77'
]);

const safeSet = (items) => [...new Set(items)].sort();
const isBlank = (value) => value === undefined || String(value).trim() === '';
const normalizeStatus = (value, allowed, fallback) => {
  const normalized = String(value || '').trim().toUpperCase().replace(/-/g, '_');
  return allowed.includes(normalized) ? normalized : fallback;
};

const looksPlaceholder = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return (
    placeholderPattern.test(normalized) ||
    normalized.startsWith('your_') ||
    normalized.startsWith('your-') ||
    normalized.includes('<set') ||
    normalized.includes('replace_me') ||
    normalized.includes('change_me') ||
    normalized.includes('dummy') ||
    normalized.includes('placeholder')
  );
};

const getCodeMainSha = () => {
  for (const candidate of ['GITHUB_SHA', 'VERCEL_GIT_COMMIT_SHA', 'DEPLOYED_SOURCE_SHA']) {
    const value = process.env[candidate]?.trim();
    if (/^[a-f0-9]{40}$/i.test(value || '')) return value;
  }

  try {
    return execSync('git rev-parse HEAD', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return 'unknown';
  }
};

const validateUrlValue = (name, value, labels) => {
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const normalized = value.toLowerCase();
    if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(hostname)) {
      labels.push('localhost_or_local_ip_detected');
    }
    if (hostname === 'example.com' || hostname.endsWith('.example.com') || hostname.endsWith('.invalid')) {
      labels.push('example_or_invalid_host_detected');
    }
    if (
      normalized.includes('testnet') ||
      normalized.includes('sepolia') ||
      normalized.includes('goerli') ||
      normalized.includes('prebsc') ||
      normalized.includes('bsc-testnet') ||
      normalized.includes('testnet-bsc') ||
      normalized.includes('bnb-testnet') ||
      normalized.includes('testnet-bnb') ||
      normalized.includes('ethereum') ||
      normalized.includes('eth-mainnet') ||
      normalized.includes('mainnet.infura')
    ) {
      labels.push('testnet_or_ethereum_endpoint_detected');
    }
    if (name === 'ETHERSCAN_API_URL') {
      const isEtherscanV2Bsc =
        hostname === 'api.etherscan.io' &&
        parsed.pathname.includes('/v2/api') &&
        parsed.searchParams.get('chainid') === '56';
      const isBscScan = hostname === 'bscscan.com' || hostname.endsWith('.bscscan.com');
      if (!isEtherscanV2Bsc && !isBscScan) labels.push('explorer_not_bsc_mainnet');
    }
  } catch {
    labels.push('invalid_url_format');
  }
};

const validateAddressValue = (value, labels) => {
  if (!evmAddressPattern.test(value)) labels.push('invalid_evm_address');
  if (zeroAddressPattern.test(value)) labels.push('zero_address_detected');
};

const validatePrivateKeyValue = (value, labels) => {
  const normalized = value.toLowerCase();
  if (!privateKeyPattern.test(value)) labels.push('invalid_private_key_format');
  if (zeroPrivateKeyPattern.test(value)) labels.push('zero_private_key_detected');
  if (knownTestPrivateKeys.has(normalized)) labels.push('known_test_private_key_detected');
};

const validateAllowlist = (value, labels) => {
  const addresses = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (addresses.length === 0) {
    labels.push('empty_prize_allowlist');
    return;
  }
  for (const address of addresses) validateAddressValue(address, labels);
};

const auditBackendEnv = (env) => {
  const labels = [];
  const missing = backendRequiredEnv.filter((name) => isBlank(env[name]));
  if (missing.length > 0) labels.push('missing_required_backend_env');

  for (const name of backendRequiredEnv) {
    const value = env[name];
    if (isBlank(value)) continue;
    const trimmed = String(value).trim();
    if (looksPlaceholder(trimmed)) labels.push('placeholder_detected');
    if (urlEnv.has(name)) validateUrlValue(name, trimmed, labels);
    if (addressEnv.has(name)) validateAddressValue(trimmed, labels);
    if (privateKeyEnv.has(name)) validatePrivateKeyValue(trimmed, labels);
  }

  if (env.CHAIN_ID?.trim() !== '56') labels.push('chain_id_not_56');
  if (!isBlank(env.PRIZE_TRANSFER_TOKEN_ALLOWLIST)) validateAllowlist(env.PRIZE_TRANSFER_TOKEN_ALLOWLIST, labels);
  if (explorerKeyEnv.every((name) => isBlank(env[name]))) labels.push('missing_explorer_api_key');

  for (const name of Object.keys(env)) {
    if (forbiddenPublicSecretPattern.test(name)) labels.push('public_secret_name_detected');
  }

  return {
    status: labels.length === 0 ? STATUS.PASS : STATUS.FAIL,
    labels: safeSet(labels)
  };
};

const auditFrontendEnv = async (env) => {
  const frontendPath = resolve(repoRoot, 'apps/frontend/env.validation.mjs');
  if (!existsSync(frontendPath)) {
    return {
      status: STATUS.PENDING,
      labels: ['frontend_validator_missing'],
      missing: []
    };
  }

  try {
    const mod = await import(pathToFileURL(frontendPath).href);
    const result = mod.validateFrontendEnv({
      ...env,
      NODE_ENV: 'production',
      NEXT_PUBLIC_APP_ENV: env.NEXT_PUBLIC_APP_ENV || 'production'
    });

    if (result.productionDisabled) {
      return {
        status: STATUS.FAIL,
        labels: ['frontend_public_env_missing_or_disabled'],
        missing: Array.isArray(result.missing) ? result.missing.filter((name) => /^[A-Z0-9_]+$/.test(name)) : []
      };
    }

    return { status: STATUS.PASS, labels: [], missing: [] };
  } catch (error) {
    const message = String(error?.message || error || '');
    const labels = [];
    if (/NEXT_PUBLIC_.*(PRIVATE_KEY|SECRET|JWT|HOT_WALLET|RELAYER_KEY|OWNER_KEY|ADMIN_KEY)/i.test(message)) {
      labels.push('public_secret_name_detected');
    }
    if (/localhost|127\.0\.0\.1|0\.0\.0\.0|::1/i.test(message)) labels.push('localhost_or_local_ip_detected');
    if (/placeholder|dummy|example|changeme|todo/i.test(message)) labels.push('placeholder_detected');
    if (/testnet|sepolia|goerli/i.test(message)) labels.push('testnet_or_ethereum_testnet_detected');
    if (/zero address/i.test(message)) labels.push('zero_address_detected');
    if (/BSC mainnet/i.test(message)) labels.push('not_bsc_mainnet');
    if (labels.length === 0) labels.push('frontend_env_validation_failed');
    return { status: STATUS.FAIL, labels: safeSet(labels), missing: [] };
  }
};

const auditForbiddenPlaceholders = (env) => {
  const labels = [];
  const relevantEnv = [...backendRequiredEnv, ...frontendRequiredPublicEnv, ...optionalPublicEnv, ...explorerKeyEnv];
  for (const name of relevantEnv) {
    const value = env[name];
    if (!isBlank(value) && looksPlaceholder(String(value))) labels.push('placeholder_detected');
  }
  for (const name of Object.keys(env)) {
    if (forbiddenPublicSecretPattern.test(name)) labels.push('public_secret_name_detected');
  }
  return labels.length === 0 ? STATUS.PASS : STATUS.FAIL;
};

const auditBscChainContractAllowlist = (env) => {
  const labels = [];
  if (env.CHAIN_ID?.trim() !== '56') labels.push('chain_id_not_56');
  for (const name of ['TOKEN_CONTRACT_ADDRESS', 'NFT_CONTRACT_ADDRESS', 'TIER_UPDATER_CONTRACT_ADDRESS']) {
    if (isBlank(env[name])) labels.push('missing_bsc_contract_env');
    else validateAddressValue(env[name].trim(), labels);
  }
  if (isBlank(env.PRIZE_TRANSFER_TOKEN_ALLOWLIST)) labels.push('missing_prize_allowlist');
  else validateAllowlist(env.PRIZE_TRANSFER_TOKEN_ALLOWLIST, labels);
  return labels.length === 0 ? STATUS.PASS : STATUS.FAIL;
};

const auditDeploymentSource = (env, codeMainSha) => {
  const shaNames = [
    'DEPLOYED_SOURCE_SHA',
    'GITHUB_SHA',
    'VERCEL_GIT_COMMIT_SHA',
    'RENDER_GIT_COMMIT',
    'RAILWAY_GIT_COMMIT_SHA',
    'SOURCE_VERSION',
    'COMMIT_SHA'
  ];
  const observed = shaNames
    .map((name) => env[name]?.trim())
    .find((value) => /^[a-f0-9]{40}$/i.test(value || ''));
  if (!observed) return STATUS.PENDING;
  return observed.toLowerCase() === String(codeMainSha).toLowerCase() ? STATUS.PASS : STATUS.FAIL;
};

const addBlocker = (blockers, status, label) => {
  if (status === STATUS.FAIL || status === STATUS.PENDING || status === STATUS.NOT_RUN) blockers.push(label);
};

const main = async () => {
  const codeMainSha = getCodeMainSha();
  const backend = auditBackendEnv(process.env);
  const frontend = await auditFrontendEnv(process.env);
  const forbiddenPlaceholderCheck = auditForbiddenPlaceholders(process.env);
  const bscChainContractAllowlistCheck = auditBscChainContractAllowlist(process.env);
  const deploymentSourceCheck = auditDeploymentSource(process.env, codeMainSha);
  const rollbackPlanCheck = normalizeStatus(
    process.env.CODEX_ROLLBACK_PLAN_STATUS || process.env.ROLLBACK_PLAN_STATUS,
    [STATUS.PASS, STATUS.FAIL, STATUS.PENDING],
    STATUS.PENDING
  );
  const runtimeEvidence = normalizeStatus(
    process.env.CODEX_RUNTIME_EVIDENCE || process.env.RUNTIME_EVIDENCE_STATUS,
    [STATUS.PASS, STATUS.FAIL, STATUS.NOT_RUN],
    STATUS.NOT_RUN
  );

  const remainingBlockers = [];
  addBlocker(remainingBlockers, backend.status, 'backend_production_env_validation');
  addBlocker(remainingBlockers, frontend.status, 'frontend_production_env_validation');
  addBlocker(remainingBlockers, forbiddenPlaceholderCheck, 'forbidden_placeholder_check');
  addBlocker(remainingBlockers, bscChainContractAllowlistCheck, 'bsc_chain_contract_allowlist_check');
  addBlocker(remainingBlockers, deploymentSourceCheck, 'deployment_source_check');
  addBlocker(remainingBlockers, rollbackPlanCheck, 'rollback_plan_check');
  addBlocker(remainingBlockers, runtimeEvidence, 'runtime_evidence');

  const report = {
    codeMainSha,
    valuesPrinted: false,
    backendProductionEnvValidation: backend.status,
    frontendProductionEnvValidation: frontend.status,
    frontendMissingEnvNames: frontend.missing,
    forbiddenPlaceholderCheck,
    bscChainContractAllowlistCheck,
    deploymentSourceCheck,
    rollbackPlanCheck,
    runtimeEvidence,
    productionReadyClaim: 'NO',
    remainingBlockers: safeSet(remainingBlockers)
  };

  console.log(JSON.stringify(report, null, 2));

  if (process.env.CODEX_PRODUCTION_READINESS_AUDIT_STRICT === '1' && remainingBlockers.length > 0) {
    process.exit(1);
  }
};

await main();
