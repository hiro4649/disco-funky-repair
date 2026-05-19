# FUNKY Known Risks

This file records known FUNKY launch and operation risks.
Known risk is not accepted risk.
Codex must not mark known risk as PASS.

## Labels

- BLOCKED: verification cannot proceed because funding, domain, human approval, environment, or external service is missing.
- UNKNOWN: evidence is missing, stale, or insufficient.
- P1: launch-relevant risk that must be fixed or explicitly reviewed before launch.
- P2: non-blocking improvement or documentation gap.
- runtime dependent: requires staging or runtime evidence.
- tx dependent: requires funded tx and receipt evidence.
- staging domain dependent: requires final staging domain and HTTPS.
- tBNB dependent: requires funded BSC testnet wallets.

UNKNOWN and BLOCKED are not PASS.

## Current Known Risks

| Risk | Label | Required evidence to remove |
| --- | --- | --- |
| staging domain is undecided | BLOCKED, staging domain dependent | Domain owner confirms staging domain and HTTPS plan. |
| tBNB is not funded | BLOCKED, tBNB dependent | Deployer, Prize hot wallet, and Tier relayer funding confirmed on BSC testnet chainId `97`. |
| runtime smoke is not executed | UNKNOWN, runtime dependent | No-tx smoke passes on the intended staging runtime. |
| secret log scan is not executed on runtime logs | UNKNOWN, runtime dependent | Runtime log secret scan passes for the intended staging runtime. |
| funded tx receipt checks are not executed | BLOCKED, tx dependent, tBNB dependent | Funded tx smoke passes with non-secret receipt evidence. |
| project is not production ready | P1, runtime dependent, tx dependent | Human release owner confirms all release gates and residual risks. |
| recent admin auth/logging fixes are not staging-confirmed | UNKNOWN, runtime dependent | Staging admin auth and safe logging smoke passes without secret exposure. |
| Prize tx evidence is not funded-tx-confirmed | UNKNOWN, tx dependent, tBNB dependent | Prize send receipt and no-double-send smoke passes with receipt evidence. |

## Risk Update Rules

- Update this file when a risk is discovered, removed, downgraded, or promoted.
- Include the evidence type required to remove each risk.
- Do not remove a risk because a local static check passed.
- Do not remove tx-dependent risk without receipt evidence.
- Do not remove runtime-dependent risk without runtime evidence.
- Do not remove staging domain dependent risk before domain and HTTPS are confirmed.
- Do not remove tBNB dependent risk before funding is confirmed.
- Do not record secret values, private keys, API keys, DB URLs, JWTs, cookies, Authorization headers, raw logs, or raw payloads.

## Removal Conditions

A risk may be removed only when:

- the authority docs allow the claim.
- current evidence exists.
- evidence is non-secret.
- the responsible human owner accepts the result when human review is required.
- the risk is not simply moved to another doc or PR body.

If evidence is incomplete, keep the risk as UNKNOWN or BLOCKED.
