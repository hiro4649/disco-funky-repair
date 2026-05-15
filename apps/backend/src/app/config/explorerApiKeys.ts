export const EXPLORER_API_KEY_ENV_ORDER = [
  'ETHERSCAN_API_KEY',
  'BSCSCAN_API_KEY',
  'ETHERSCAN_API_KEY1',
  'ETHERSCAN_API_KEY2',
  'BSCSCAN_API_KEY1',
  'BSCSCAN_API_KEY2'
] as const;

type EnvMap = NodeJS.ProcessEnv;

export const getExplorerApiKeys = (env: EnvMap = process.env): string[] => {
  const seen = new Set<string>();

  return EXPLORER_API_KEY_ENV_ORDER
    .map((name) => env[name]?.trim())
    .filter((value): value is string => Boolean(value))
    .filter((value) => {
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
};

export const getPrimaryExplorerApiKey = (env: EnvMap = process.env): string | undefined =>
  getExplorerApiKeys(env)[0];
