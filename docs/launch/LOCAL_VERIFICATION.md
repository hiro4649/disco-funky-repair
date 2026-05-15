# Local Verification

Run these commands from a fresh clone of `hiro4649/disco-funky-repair`.

Do not create, print, or commit `.env`, private keys, API keys, JWT secrets, DB connection strings, or production logs while running local verification.

## Backend

```powershell
cd apps/backend
npm ci
npm run build
npm test
```

`npm run build` runs `prisma generate` first so the generated Prisma Client matches `prisma/schema.prisma`.

## Frontend

```powershell
cd apps/frontend
npm ci
npm run build
```

If `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_APP_NAME` is not set, the local build uses non-secret placeholders for metadata generation. If `NEXT_PUBLIC_API_URL` is not set, the local build skips Next.js proxy rewrites. Set real public runtime values only in an approved local, staging, or production environment.

## Contracts

```powershell
cd contracts
npm ci
npx hardhat compile
npx hardhat test
```

The default Hardhat config verifies the FUNKY token suite. The NFT suite has its own config and should be checked with:

```powershell
cd contracts
npm run compile:nft
npm run test:nft
```
