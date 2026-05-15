import assert from "node:assert/strict";
import { validateFrontendEnv } from "./env.validation.mjs";

const validEnv = {
  NODE_ENV: "production",
  NEXT_PUBLIC_API_URL: "https://api.funky.fan",
  NEXT_PUBLIC_APP_URL: "https://funky.fan",
  NEXT_PUBLIC_APP_NAME: "FUNKY",
  NEXT_PUBLIC_RPC_URL: "https://bsc-mainnet.public-rpc.provider",
  NEXT_PUBLIC_TOKEN_ADDRESS: "0x1111111111111111111111111111111111111111",
  NEXT_PUBLIC_NFT_ADDRESS: "0x2222222222222222222222222222222222222222",
};

assert.deepEqual(validateFrontendEnv(validEnv), {
  productionDisabled: false,
  missing: [],
});

for (const rpcUrl of [
  "http://localhost:8545",
  "http://127.0.0.1:8545",
  "https://example.com/rpc",
  "dummy",
  "https://dummy.rpc.provider",
  "",
  "not a url",
  "https://bsc-testnet.public-rpc.provider",
  "https://sepolia.public-rpc.provider",
  "https://goerli.public-rpc.provider",
]) {
  assert.throws(
    () => validateFrontendEnv({
      ...validEnv,
      NEXT_PUBLIC_ALCHEMY_RPC_URL: rpcUrl,
    }),
    /NEXT_PUBLIC_ALCHEMY_RPC_URL/
  );
}

assert.doesNotThrow(() =>
  validateFrontendEnv({
    ...validEnv,
  })
);

assert.throws(
  () => validateFrontendEnv({
    ...validEnv,
    NEXT_PUBLIC_ADMIN_PRIVATE_KEY: "0x1111111111111111111111111111111111111111111111111111111111111111",
  }),
  /NEXT_PUBLIC_ADMIN_PRIVATE_KEY/
);

console.log("frontend env validation tests passed");
