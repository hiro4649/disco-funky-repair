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

- Env currently used by tier code: `ADMIN_PRIVATE_KEY`
- P0-10A does not change tier relayer signing.
- Follow-up P0 work should move tier sync to a dedicated relayer key that has only the minimum relayer permission on `FunkyTierUpdater`.

### Governance / owner / admin authority

- Must be controlled by multisig or timelock before launch.
- Must not be held by the public backend hot wallet.
- Backend should not perform broad governance actions with the same signer used for prize payouts.

## Staging Setup

1. Create a fresh prize hot wallet for staging.
2. Fund it with test native gas only.
3. Transfer only test prize tokens required for payout testing.
4. Set `PRIZE_HOT_WALLET_PRIVATE_KEY` in the server secret manager.
5. Set `PRIZE_TRANSFER_TOKEN_ALLOWLIST` to the staging prize ERC-20 token address list.
6. Confirm `ADMIN_PRIVATE_KEY` alone cannot start prize transfers.
7. Confirm an allowlist-missing token moves the prize transaction to manual review and does not broadcast a transfer.

## Production Setup

1. Create a fresh production prize hot wallet.
2. Store the private key only in the production secret manager.
3. Fund the wallet with limited operational gas and prize token inventory.
4. Set `PRIZE_HOT_WALLET_PRIVATE_KEY`.
5. Set `PRIZE_TRANSFER_TOKEN_ALLOWLIST` to the approved BSC prize ERC-20 addresses.
6. Confirm the prize hot wallet has no owner, tier updater, admin, multisig, or governance role.
7. Rotate any old backend key that previously held shared payout/admin authority.

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
```

Do not print private keys, RPC URLs, DB URLs, API keys, or JWT secrets in logs, tickets, PRs, or runbooks.

## Remaining P0 Follow-ups

- Split tier relayer signing from `ADMIN_PRIVATE_KEY`.
- Disable or move governance/admin on-chain operations behind multisig or timelock.
- Add operational monitoring for hot wallet token and gas balances without exposing the secret key.
