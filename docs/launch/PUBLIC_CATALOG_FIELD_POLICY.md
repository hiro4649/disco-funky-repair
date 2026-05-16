# Public Catalog Field Policy

## Status

- Scope: P1-READ-07 public catalog field minimization
- Staging reflection: not performed because the staging domain is still undecided
- Tx verification: not performed because BNB/tBNB is not funded
- Production ready: no. This document is not production launch approval.

## Rule

Public catalog and public reference routes must return only display or user-facing claim fields. Admin-only data, internal inventory, reservation state, transfer configuration, transaction hashes, audit actors, user-specific ownership state, and secret-like values must stay behind `AuthAdmin` or authenticated owner routes.

Public reference/status routes and static image/icon serving are documented separately in `docs/launch/PUBLIC_REFERENCE_STATUS_FIELD_POLICY.md`.

## Public Routes

### `GET /api/airdrop/prize`

Allowed fields:

- `id`
- `ranking`
- `token_name`
- `symbol`
- `quantity`
- `price`
- `probability`
- `fake_probability`
- `ca`
- `telegram`
- `twitter`
- `discord`
- `icon`
- `default_image`
- `listed_DEX`
- `tokenDetail.token_symbol`
- `tokenDetail.price`
- `tokenDetail.fdv`
- `tokenDetail.market_cap`
- `tokenDetail.scarcityScore`
- `tokenDetail.volume_24h`
- `tokenDetail.liquidity`
- `tokenDetail.txns_24h`

Forbidden fields:

- `balance`
- `balance_amount`
- `reserved_amount`
- `real_probability`
- `saved_probability`
- `earned_pts`
- `decimals`
- `transfer_token_address`
- `transfer_amount`
- `reservation_released_at`
- `txHash`
- admin-only or user-specific fields

### `GET /api/nfts/mintable`

Allowed fields:

- `id`
- `name`
- `description`
- `image`

Forbidden fields:

- `holderId`
- `owner`
- `creator`
- `royalty`
- `collectionId`
- `ipfsCid`
- `mintStatus`
- `excelUploaded`
- `ipfsUploaded`
- `imageMatched`
- `createdAt`
- `updatedAt`

### `GET /api/nft/:id`

Allowed fields:

- `id`
- `name`
- `description`
- `image`
- `attributes`
- `externalUrl`
- `ipfsCid`

Forbidden fields:

- `holderId`
- `owner`
- `creator`
- `royalty`
- `collectionId`
- internal upload state in the response
- `createdAt`
- `updatedAt`

The controller may query `mintStatus` and `ipfsUploaded` internally to prevent serving minted or not-yet-IPFS-uploaded NFTs, but those fields must not be returned in the public response.

### `GET /api/trial-nft-templates/available`

Allowed fields:

- `id`
- `name`
- `description`
- `image`
- `validDays`

Forbidden fields:

- `maxMints`
- `mintCount`
- `isAvailable`
- `createdAt`
- `updatedAt`
- user-specific Trial NFT state

The controller may use `maxMints` and `mintCount` internally to filter unavailable templates, but those fields must not be returned in the public response.

### `GET /api/illustration/:id`

Allowed fields:

- `id`
- `image_url`
- `earned_pts`
- `rarity`

Forbidden fields:

- `probability`
- `createdAt`
- `updatedAt`
- user-specific `IllustrationHistory` state

### `GET /api/illustration/rarity/:rarity`

Allowed fields:

- `id`
- `image_url`
- `earned_pts`
- `rarity`

Forbidden fields:

- `probability`
- `createdAt`
- `updatedAt`
- user-specific `IllustrationHistory` state

The controller may order internally by `probability`, but must not return it publicly.

### `GET /api/news/:id`

Allowed fields:

- `id`
- `title`
- `content`
- `image_url`
- `createdAt`

Forbidden fields:

- `updatedAt`
- `changedBy`
- `createdBy`
- admin-only metadata

### `GET /api/fee/current`

Allowed fields:

- `feePercentage`
- `feeRecipient`
- `lastUpdated.percentage`
- `lastUpdated.recipient`

Forbidden fields:

- `changedBy`
- `txHash`
- fee history records
- admin metadata

### Public healthcheck

Allowed fields:

- `status`
- `timestamp`
- `healthy`

Forbidden fields:

- RPC provider details
- credit usage
- failure counts
- reconnect attempts
- projection data
- secret-like values

## Verification

The backend test suite contains regression tests for the public field policy. If a public route intentionally changes its fields, update this document and the corresponding tests in the same PR.
