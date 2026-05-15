# Governance Runbook

Status: pre-launch. No production keys, RPC URLs, DB URLs, API keys, or secrets are stored in this repository.

## Purpose

P0-10C removes backend hot-wallet execution for governance, fee, DEX, pair, factory, and fee-exemption changes. These actions directly affect tokenomics and must be handled through multisig, timelock, and human review.

## Disabled Backend Writes

The backend must not broadcast these token-management transactions:

- `update_fee_percentage(uint16,uint16)`
- `update_fee_recipient(address)`
- `add_factory(address)`
- `remove_factory(address)`
- `add_dex(address)`
- `remove_dex(address)`
- `add_pair(address)`
- `remove_pair(address)`
- `set_fee_exempt(address,bool,uint256,string)`

If an API endpoint for these operations exists, it must return `410` with `MANUAL_REVIEW_REQUIRED`, or remain read-only. The backend must not update DB records in a way that claims an on-chain governance write has already completed.

## Required Controls

- Token owner/admin authority must be held by multisig or timelock before launch.
- Backend hot wallets must not be token owner, admin, fee manager, pair manager, factory manager, or multisig signer.
- Every governance proposal must include target contract, chain ID, function signature, decoded arguments, expected state change, and rollback/mitigation plan.
- Execute staging first with non-production contracts and non-production wallets.
- Store tx hashes and receipts after execution, but do not store private keys or secret RPC values.

## Fee Percentage Change

1. Confirm the requested tier is one of `0,31,91,181,271,361,541,721`.
2. Confirm the requested fee is within the contract limit and launch policy.
3. Prepare a multisig or timelock transaction for `update_fee_percentage(tier,newFeePercent)`.
4. Simulate or dry-run against staging.
5. Execute from multisig/timelock only.
6. Verify on-chain `feePercent(tier)` after confirmation.
7. Record the tx hash, receipt, operator, approval evidence, and resulting value in the operations log.

## Fee Recipient Change

1. Verify the recipient address and ownership controls.
2. Confirm the recipient is not a public backend hot wallet.
3. Prepare a multisig or timelock transaction for `update_fee_recipient(newRecipient)`.
4. Execute from multisig/timelock only.
5. Verify on-chain `feeRecipient()` after confirmation.
6. Record the tx hash, receipt, approval evidence, old recipient, and new recipient in the operations log.

## Pair / DEX Registration

1. Verify the pair belongs to the intended token and approved DEX factory.
2. If the factory is not already approved, prepare `add_factory(factory)` first.
3. Prepare `add_pair(pair)` or `add_dex(pair)` from multisig/timelock.
4. Execute staging first.
5. Execute production from multisig/timelock only.
6. Verify on-chain `isFactory(factory)` and `isDex(pair)` after confirmation.
7. Record the tx hash, receipt, pair tokens, factory address, and approval evidence in the operations log.

## Tier Updater Registration

1. Verify the deployed `FunkyTierUpdater` address and chain ID.
2. Transfer `FunkyTierUpdater` ownership/admin control to multisig before launch.
3. Grant only the dedicated tier relayer wallet the minimum relayer permission.
4. Confirm `TIER_RELAYER_PRIVATE_KEY` is not reused as `ADMIN_PRIVATE_KEY`, prize hot wallet, token owner, or multisig signer.
5. Revoke deployer, test, or old shared-key relayers before launch.
6. Record owner, relayer, tx hashes, and verification output.

## Fee Exemption Change

1. Confirm the address, exemption direction, expiry, and business reason.
2. Prefer a time-limited exemption with a documented expiry.
3. Prepare `set_fee_exempt(account,exempt,expiresAt,reason)` from multisig/timelock.
4. Execute staging first.
5. Execute production from multisig/timelock only.
6. Verify the exemption state on-chain after confirmation.
7. Record the tx hash, receipt, expiry, and approval evidence.

## Verification

Backend checks:

```bash
cd apps/backend
npm run build
npm test -- --runInBand
```

Manual checks:

- `POST /dex/add` returns `410` and does not write `dexList`.
- `DELETE /dex/remove/:address` returns `410` and does not write `dexList`.
- `POST /fee/record` returns `410` and does not write `feeChangeHistory`.
- `ADMIN_PRIVATE_KEY` alone cannot broadcast fee, DEX, pair, factory, or fee-exemption writes from backend code.

## Rollback / Mitigation

- If an incorrect fee is set, submit a new multisig/timelock transaction to restore the previous value.
- If an incorrect pair is registered, submit `remove_pair(pair)` or `remove_dex(pair)` from multisig/timelock.
- If an incorrect factory is registered, submit `remove_factory(factory)` after confirming no valid pairs depend on it.
- If a hot wallet accidentally receives governance authority, revoke that authority immediately and rotate the exposed key.
