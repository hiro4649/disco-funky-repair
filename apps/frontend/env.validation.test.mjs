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

const validStagingEnv = {
  ...validEnv,
  NEXT_PUBLIC_APP_ENV: "staging",
  NEXT_PUBLIC_API_URL: "https://api.staging.funky.fan",
  NEXT_PUBLIC_APP_URL: "https://staging.funky.fan",
  NEXT_PUBLIC_RPC_URL: "https://bsc-testnet.public-rpc.provider",
  NEXT_PUBLIC_SOCKET_API_URL: "https://api.staging.funky.fan",
  NEXT_PUBLIC_ETHERSCAN_EXPLORER: "https://testnet.bscscan.com",
};

assert.deepEqual(validateFrontendEnv(validEnv), {
  productionDisabled: false,
  missing: [],
});

for (const appEnv of [undefined, "production"]) {
  assert.throws(
    () => validateFrontendEnv({
      ...validEnv,
      NEXT_PUBLIC_APP_ENV: appEnv,
      NEXT_PUBLIC_RPC_URL: "https://bsc-testnet.public-rpc.provider",
    }),
    /NEXT_PUBLIC_RPC_URL/
  );
}

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

assert.deepEqual(validateFrontendEnv(validStagingEnv), {
  productionDisabled: false,
  missing: [],
});

assert.doesNotThrow(() =>
  validateFrontendEnv({
    ...validStagingEnv,
    NEXT_PUBLIC_ALCHEMY_RPC_URL: "https://bsc-testnet.alchemy.public-rpc.provider",
  })
);

assert.doesNotThrow(() =>
  validateFrontendEnv({
    ...validStagingEnv,
    NEXT_PUBLIC_ALCHEMY_RPC_URL: undefined,
  })
);

for (const name of ["NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_SOCKET_API_URL"]) {
  for (const url of ["http://localhost:3001", "http://127.0.0.1:3001"]) {
    assert.throws(
      () => validateFrontendEnv({
        ...validStagingEnv,
        [name]: url,
      }),
      new RegExp(name)
    );
  }
}

for (const rpcUrl of [
  "http://localhost:8545",
  "http://127.0.0.1:8545",
  "https://example.com/rpc",
  "dummy",
  "",
  "not a url",
  "https://sepolia.public-rpc.provider",
  "https://goerli.public-rpc.provider",
]) {
  assert.throws(
    () => validateFrontendEnv({
      ...validStagingEnv,
      NEXT_PUBLIC_ALCHEMY_RPC_URL: rpcUrl,
    }),
    /NEXT_PUBLIC_ALCHEMY_RPC_URL/
  );
}

assert.throws(
  () => validateFrontendEnv({
    ...validStagingEnv,
    NEXT_PUBLIC_ETHERSCAN_EXPLORER: "https://bscscan.com",
  }),
  /NEXT_PUBLIC_ETHERSCAN_EXPLORER/
);

assert.throws(
  () => validateFrontendEnv({
    ...validStagingEnv,
    NEXT_PUBLIC_ETHERSCAN_EXPLORER: "http://testnet.bscscan.com",
  }),
  /NEXT_PUBLIC_ETHERSCAN_EXPLORER/
);

assert.throws(
  () => validateFrontendEnv({
    ...validStagingEnv,
    NEXT_PUBLIC_ADMIN_PRIVATE_KEY: "",
  }),
  /NEXT_PUBLIC_ADMIN_PRIVATE_KEY/
);

assert.throws(
  () => validateFrontendEnv({
    NODE_ENV: "development",
    NEXT_PUBLIC_ADMIN_PRIVATE_KEY: "",
  }),
  /NEXT_PUBLIC_ADMIN_PRIVATE_KEY/
);

assert.throws(
  () => validateFrontendEnv({
    ...validEnv,
    NEXT_PUBLIC_APP_ENV: "qa",
  }),
  /NEXT_PUBLIC_APP_ENV/
);

console.log("frontend env validation tests passed");
