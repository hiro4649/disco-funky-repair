# Key Separation Runbook

Status: pre-launch. No production keys or real RPC values are stored in this repository.

## Purpose

P0-10A separates prize token transfers from the broader backend admin key. A compromise of the public backend prize transfer path must not automatically expose tier updater, governance, or contract admin authority.

## Key Roles

### Prize hot wallet

- Env: `PRIZE_HOT_WALLET_PRIVATE_KEY`
- Scope: ERC-20 prize payouts only.
- Must hold only the minimum token and native gas balance needed for payout operations.
- Must not be the contract owner, tier updater owner, governance wallet, or multisig signer.
- Must not reuse `ADMIN_PRIVATE_KEY`.

### Prize transfer token allowlist

- Env: `PRIZE_TRANSFER_TOKEN_ALLOWLIST`
- Format: comma-separated ERC-20 contract addresses.
- Scope: only tokens in this allowlist can be transferred by the prize payout helper.
- If the allowlist is empty, malformed, or missing either `Prize.ca` or the fixed `PrizeTransactions.transfer_token_address`, payout is blocked and the prize transaction requires manual review.

### Tier relayer

- Env: `TIER_RELAYER_PRIVATE_KEY`
- Scope: holding tier sync through `FunkyTierUpdater` only.
- Must not reuse `ADMIN_PRIVATE_KEY` or `PRIZE_HOT_WALLET_PRIVATE_KEY`.
- Must be granted relayer permission on `FunkyTierUpdater` by the contract owner or launch multisig.
- Must not be the `FunkyTierUpdater` owner, token owner, governance wallet, prize hot wallet, or multisig signer.
- If `TIER_RELAYER_PRIVATE_KEY` or `TIER_UPDATER_CONTRACT_ADDRESS` is missing, backend tier sync must not send a transaction.

### Governance / owner / admin authority

- Must be controlled by multisig or timelock before launch.
- Must not be held by the public backend hot wallet.
- Backend must not perform governance, fee, DEX, pair, factory, or fee-exemption writes with `ADMIN_PRIVATE_KEY` or any hot wallet.
- Fee changes, fee recipient changes, pair/factory registration, tier updater registration, and fee exemption changes must go through the governance runbook, then multisig or timelock execution.
- Backend governance APIs, if present, must be disabled, manual-review only, or read-only.

### Frontend public environment variables

- Never put private keys, admin keys, owner keys, relayer keys, hot wallet keys, or multisig signer keys in `NEXT_PUBLIC_*`.
- `NEXT_PUBLIC_*` values are bundled into browser JavaScript and must be treated as public.
- Frontend admin screens must not create `ethers.Wallet` from any private key.
- Frontend admin screens must not directly sign or broadcast governance, fee, DEX, pair, token owner, NFT owner, tier updater, or hot-wallet transactions.
- Frontend admin screens may show read-only chain state. Write operations must route to disabled backend endpoints, manual review, or the governance runbook and multisig/timelock workflow.

## Staging Setup

1. Create a fresh prize hot wallet for staging.
2. Fund it with test native gas only.
3. Transfer only test prize tokens required for payout testing.
4. Set `PRIZE_HOT_WALLET_PRIVATE_KEY` in the server secret manager.
5. Set `PRIZE_TRANSFER_TOKEN_ALLOWLIST` to the staging prize ERC-20 token address list.
6. Set `TIER_RELAYER_PRIVATE_KEY` to a separate staging relayer wallet.
7. Set `TIER_UPDATER_CONTRACT_ADDRESS` to the staging `FunkyTierUpdater`.
8. From the staging `FunkyTierUpdater` owner or multisig, grant relayer permission only to the tier relayer wallet.
9. Confirm `ADMIN_PRIVATE_KEY` alone cannot start prize transfers, tier updates, fee changes, or DEX/pair management transactions.
10. Confirm governance/fee/DEX/pair write APIs return manual-review or disabled responses and do not update DB records as on-chain-complete.
11. Confirm an allowlist-missing token moves the prize transaction to manual review and does not broadcast a transfer.
12. Confirm staging frontend env does not contain `NEXT_PUBLIC_*PRIVATE_KEY` and admin screens remain manual-review/read-only.

## Production Setup

1. Create a fresh production prize hot wallet.
2. Store the private key only in the production secret manager.
3. Fund the wallet with limited operational gas and prize token inventory.
4. Set `PRIZE_HOT_WALLET_PRIVATE_KEY`.
5. Set `PRIZE_TRANSFER_TOKEN_ALLOWLIST` to the approved BSC prize ERC-20 addresses.
6. Set `TIER_RELAYER_PRIVATE_KEY`.
7. Set `TIER_UPDATER_CONTRACT_ADDRESS`.
8. Transfer `FunkyTierUpdater` ownership to multisig before launch.
9. From multisig, grant relayer permission to the tier relayer wallet and revoke any deployer/test relayers.
10. Confirm the prize hot wallet and tier relayer have no owner, admin, multisig signer, or governance role beyond their narrow purpose.
11. Configure token owner/admin roles so governance, fee, DEX, pair, factory, and fee-exemption writes require multisig or timelock approval.
12. Rotate any old backend key that previously held shared payout/tier/admin authority.
13. Confirm production frontend env does not contain `NEXT_PUBLIC_*PRIVATE_KEY` and browser bundles cannot create admin, owner, relayer, governance, or hot-wallet signers.

## Verification Commands

Run these from `apps/backend` after setting non-production test secrets:

```bash
npm run build
npm test -- --runInBand
```

Manual staging checks:

```bash
# Expected: payout fails safely; no transfer is broadcast.
unset PRIZE_HOT_WALLET_PRIVATE_KEY

# Expected: allowlisted staging token can proceed through the existing payout flow.
export PRIZE_TRANSFER_TOKEN_ALLOWLIST="0x..."

# Expected: non-allowlisted token cannot be transferred and requires manual review.
export PRIZE_TRANSFER_TOKEN_ALLOWLIST="0xApprovedOnly..."

# Expected: tier sync fails safely and does not broadcast.
unset TIER_RELAYER_PRIVATE_KEY

# Expected: tier sync fails safely and does not broadcast.
unset TIER_UPDATER_CONTRACT_ADDRESS

# Expected: governance write APIs fail with manual-review or disabled responses and do not broadcast.
curl -X POST "$BACKEND_URL/dex/add"
curl -X POST "$BACKEND_URL/fee/record"
```

Frontend checks:

```bash
rg -n "NEXT_PUBLIC_.*PRIVATE_KEY|ADMIN_PRIVATE_KEY|PRIVATE_KEY|new ethers\\.Wallet|ethers\\.Wallet|new Wallet|sendTransaction|writeContract" apps/frontend/src apps/frontend/utils
rg -n "add_admin|remove_admin|add_dex|remove_dex|update_fee_percentage|update_fee_recipient|setMintUsdPrice|setDefaultRoyalty|withdraw\\(" apps/frontend/src/components/admin apps/frontend/src/utils
```

Do not print private keys, RPC URLs, DB URLs, API keys, or JWT secrets in logs, tickets, PRs, or runbooks.

## Remaining P0 Follow-ups

- Add operational monitoring for hot wallet token and gas balances without exposing the secret key.
- Add dedicated monitoring for the tier relayer gas balance without exposing the secret key.
