# FUNKY-AUDIT-03 Runtime Log Sanitize Evidence

Date: 2026-05-16 JST

Repository: `hiro4649/disco-funky-repair`

Checked commit:

- `9622675e85d28b6df3fde7133c35210fd9a0ac24`
- Subject: `fix: sanitize explorer failure logs (#53)`

This report is a documentation-only staging runtime log evidence inventory after PR #53. It does not modify code, does not run transaction flows, does not deploy contracts, does not mint NFTs, does not call `sendToWallet`, does not send tier relayer transactions, and is not production launch approval.

## PR #53 Reflection

PR #53 is reflected in the checked main commit. The relevant change is `fix: sanitize explorer failure logs (#53)`, which added safe logging for Explorer/RPC/IPFS failure paths and tests for secret-like log redaction.

## Scan Status

Runtime PM2 and nginx logs are external staging artifacts and are not stored in this repository. Codex did not have direct access to the staging PM2 backend log, PM2 frontend log, or nginx access/error logs during this documentation update.

Result:

| Target | Status | Reason |
| --- | --- | --- |
| PM2 backend logs | `BLOCKED` / `UNKNOWN` | Staging runtime log file content was not available in this workspace. |
| PM2 frontend logs | `BLOCKED` / `UNKNOWN` | Staging runtime log file content was not available in this workspace. |
| nginx access logs | `BLOCKED` / `UNKNOWN` | Staging runtime log file content was not available in this workspace. |
| nginx error logs | `BLOCKED` / `UNKNOWN` | Staging runtime log file content was not available in this workspace. |

Do not treat this report as a PASS result for runtime logs until a human runs the scan on the staging server and records only a sanitized PASS/FAIL summary.

## Scan Targets

The staging runtime scan must cover the current log window after PR #53 is deployed and the services are restarted:

- PM2 backend logs
- PM2 frontend logs
- nginx access logs
- nginx error logs

If PM2 log rotation is enabled, include the active backend/frontend PM2 log files for the current smoke window. Do not scan or paste old logs as proof for the current commit unless they are explicitly tied to the checked commit and current restart window.

## Detection Patterns

The following patterns are forbidden in runtime logs:

- `apikey=`
- `Authorization:`
- `Bearer`
- `DATABASE_URL`
- `JWT_SECRET`
- `SESSION_SECRET`
- `PRIVATE_KEY`
- `postgresql://`
- `0x` followed by 64 hex characters

Additional forbidden categories:

- Explorer/BSCScan/Etherscan URLs with query strings containing API keys
- RPC URLs with query strings or embedded credentials
- DB connection strings
- JWTs or cookies
- private keys, seed phrases, or key prefixes
- raw upstream error objects that include request config, request URL, headers, or response body containing secrets

## Safe Scan Commands

Run these commands on the staging server only. They print filenames and line numbers for matches, so if a match occurs, do not paste the raw matching line into git, PRs, issues, tickets, or chat. Record only a sanitized summary.

```bash
set -euo pipefail

cd /path/to/staging/github/checkout
git rev-parse HEAD
git log -1 --oneline

pm2 list
pm2 describe <backend-process-name>
pm2 describe <frontend-process-name>

sudo nginx -t
sudo systemctl is-active nginx

PATTERN='apikey=|Authorization:|Bearer|DATABASE_URL|JWT_SECRET|SESSION_SECRET|PRIVATE_KEY|postgresql://|0x[a-fA-F0-9]{64}'

grep -RInE "$PATTERN" \
  "$HOME/.pm2/logs" \
  /var/log/nginx \
  --exclude='*.gz' \
  --exclude='*.zip' \
  --exclude='*.tar' \
  --exclude='*.tar.gz'
```

If the environment uses a different PM2 home or nginx log directory, replace the paths with the actual staging paths. Do not write secret values into the command line.

## Recommended Current-Window Procedure

Use this sequence for a clean current-window proof:

1. Confirm the staging checkout is at commit `9622675e85d28b6df3fde7133c35210fd9a0ac24` or a later approved main commit.
2. Confirm PR #53 is included in the running source.
3. Flush PM2 logs for a new scan window:

```bash
pm2 flush
```

4. Restart backend and frontend through the approved PM2 process names.
5. Run no-tx smoke only. Do not run tx flows while tBNB is unfunded.
6. Run the detection scan in the previous section.
7. Record only:
   - checked commit
   - process names
   - scan target paths
   - PASS/FAIL
   - sanitized count by pattern if there are matches
   - remediation ticket/PR number if there are matches

## Raw Secret Handling Policy

Raw logs must not be pasted into this repository.

If a forbidden pattern matches:

- Do not paste the raw log line.
- Do not paste surrounding lines.
- Do not paste any URL, token, JWT, cookie, DB URL, private key, API key, or header value.
- Record only a sanitized summary, for example:
  - `PM2 backend: 2 matches for apikey= in Explorer failure log; raw values withheld; production No-Go remains.`
  - `nginx error log: 1 Bearer-like match in request header logging; raw value withheld; production No-Go remains.`

## Runtime Scan Result

Current result for this PR:

| Item | Result |
| --- | --- |
| PR #53 included in checked commit | `PASS` by git history: `9622675e85d28b6df3fde7133c35210fd9a0ac24` |
| PM2 backend log scan | `BLOCKED` / `UNKNOWN` |
| PM2 frontend log scan | `BLOCKED` / `UNKNOWN` |
| nginx access log scan | `BLOCKED` / `UNKNOWN` |
| nginx error log scan | `BLOCKED` / `UNKNOWN` |
| Raw secret pasted into this document | `PASS`: none intentionally included |
| tBNB-funded tx checks | `BLOCKED`: not executed because tBNB is not funded |
| production ready | `NO-GO`: this report is not production launch approval |

## No-Go Conditions

Production launch remains blocked if any of the following are true:

1. PM2 backend logs contain any forbidden pattern.
2. PM2 frontend logs contain any forbidden pattern.
3. nginx access or error logs contain any forbidden pattern.
4. Runtime scan has not been executed after PR #53 deployment and service restart.
5. A match exists but only raw logs were captured, with no sanitized summary and no remediation tracking.
6. tBNB-funded tx verification remains incomplete.
7. Production secret manager, deploy source, backups, monitoring, and log rotation are not human-verified.

## tBNB Status

tBNB remains unfunded for this no-tx phase. The following were not executed and must not be treated as PASS:

- BSC testnet contract deploy
- `sendToWallet` real transfer
- NFT mint
- tier relayer transaction
- prize transfer receipt retry
- any on-chain governance or ownership transaction

## Commands Executed In This Workspace

```powershell
git fetch origin --prune
git switch -C codex/funky-audit-03-runtime-log-evidence origin/main
git rev-parse HEAD
git diff --check
```

Result:

- `git diff --check`: PASS

No runtime PM2/nginx log scan was executed by Codex because staging runtime log files were not available in this workspace and raw logs may contain secrets.
