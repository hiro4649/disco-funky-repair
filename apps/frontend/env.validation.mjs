const REQUIRED_PRODUCTION_PUBLIC_ENV = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_APP_NAME",
  "NEXT_PUBLIC_RPC_URL",
  "NEXT_PUBLIC_TOKEN_ADDRESS",
  "NEXT_PUBLIC_NFT_ADDRESS",
];

const PUBLIC_ADDRESS_ENV = new Set([
  "NEXT_PUBLIC_TOKEN_ADDRESS",
  "NEXT_PUBLIC_NFT_ADDRESS",
]);

const PUBLIC_URL_ENV = new Set([
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_RPC_URL",
  "NEXT_PUBLIC_ALCHEMY_RPC_URL",
  "NEXT_PUBLIC_SOCKET_API_URL",
  "NEXT_PUBLIC_ETHERSCAN_EXPLORER",
]);

const FORBIDDEN_PUBLIC_SECRET_PATTERN =
  /^NEXT_PUBLIC_.*(PRIVATE_KEY|SECRET|ADMIN_KEY|OWNER_KEY|RELAYER_KEY|HOT_WALLET|JWT)/i;
const ETH_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const ZERO_ADDRESS = /^0x0{40}$/i;

const isBlank = (value) => !value || value.trim() === "";

const looksPlaceholder = (value) => {
  const normalized = value.trim().toLowerCase();
  return (
    /^(dummy|example|placeholder|changeme|change-me|todo|undefined|null)$/.test(normalized) ||
    normalized.startsWith("your_") ||
    normalized.startsWith("your-") ||
    normalized.includes("<set") ||
    normalized.includes("replace_me") ||
    normalized.includes("change_me") ||
    normalized.includes("dummy") ||
    normalized.includes("placeholder")
  );
};

const validatePublicUrl = (name, value) => {
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const normalized = value.toLowerCase();

    if (["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(hostname)) {
      return `${name} must not point to localhost in production`;
    }
    if (hostname === "example.com" || hostname.endsWith(".example.com") || hostname.endsWith(".invalid")) {
      return `${name} must not use example or invalid hosts in production`;
    }
    if (normalized.includes("testnet") || normalized.includes("sepolia") || normalized.includes("goerli")) {
      return `${name} must point to BSC mainnet, not a testnet RPC`;
    }

    return null;
  } catch {
    return `${name} must be a valid URL`;
  }
};

const validatePublicAddress = (name, value) => {
  if (!ETH_ADDRESS.test(value)) {
    return `${name} must be a valid EVM address`;
  }
  if (ZERO_ADDRESS.test(value)) {
    return `${name} must not be the zero address`;
  }
  return null;
};

export const validateFrontendEnv = (env = process.env) => {
  const missing = [];
  const invalid = [];

  for (const [name, value] of Object.entries(env)) {
    if (value && FORBIDDEN_PUBLIC_SECRET_PATTERN.test(name)) {
      invalid.push(`${name} must not be exposed with NEXT_PUBLIC_`);
    }
  }

  if (env.NODE_ENV !== "production") {
    if (invalid.length > 0) {
      throw new Error(`Invalid frontend environment. ${invalid.join("; ")}`);
    }
    return { productionDisabled: false, missing: [] };
  }

  for (const name of REQUIRED_PRODUCTION_PUBLIC_ENV) {
    const value = env[name];
    if (isBlank(value)) {
      missing.push(name);
      continue;
    }

    const trimmed = value.trim();
    if (looksPlaceholder(trimmed)) {
      invalid.push(`${name} uses a placeholder value`);
      continue;
    }

    if (PUBLIC_URL_ENV.has(name)) {
      const error = validatePublicUrl(name, trimmed);
      if (error) invalid.push(error);
    }

    if (PUBLIC_ADDRESS_ENV.has(name)) {
      const error = validatePublicAddress(name, trimmed);
      if (error) invalid.push(error);
    }
  }

  for (const name of PUBLIC_URL_ENV) {
    const value = env[name];
    if (value === undefined) {
      continue;
    }
    if (isBlank(value)) {
      invalid.push(`${name} must not be empty when configured`);
      continue;
    }

    const trimmed = value.trim();
    if (looksPlaceholder(trimmed)) {
      invalid.push(`${name} uses a placeholder value`);
      continue;
    }

    const error = validatePublicUrl(name, trimmed);
    if (error && !invalid.includes(error)) invalid.push(error);
  }

  if (invalid.length > 0) {
    throw new Error(`Invalid frontend environment. ${invalid.join("; ")}`);
  }

  return { productionDisabled: missing.length > 0, missing };
};
