# FUNKY Initial Human Source Baseline

## Purpose

This orphan branch stores a sanitized, isolated copy of the user-provided initial human-written FUNKY source for semantic audit against current main.

## Source

- Source type: user-provided initial human-written FUNKY source archives
- Input archives:
  - unky-export.tar.gz
  - Funky-Contracts-main.zip
- Created at: $createdAt
- Created by: Codex
- Current main SHA used for comparison: $currentMain

## Secret Scan Result

- Result: PASS for the sanitized baseline candidate
- Method: repository secret scan plus external baseline grep/regex scan over sanitized files
- Non-blocking note: cookie-handling code references were detected, but no literal secret-like cookie value was found in the baseline candidate

## Excluded Paths And Files

The following were excluded from the baseline candidate before commit:

- .git/
- 
ode_modules/
- dist/
- uild/
- .next/
- coverage/
- logs/ and log/
- uploads/
- 	mp/
- .idea/
- .env and .env.*
- *.pem, *.p12, *.pfx, *.key
- OS-generated files such as .DS_Store and Thumbs.db
- Unsafe or unsupported symlink: source-export/etc/nginx/funky.fan

## Warnings

- Do not merge this branch into main.
- This baseline is for semantic audit only.
- This baseline is not an implementation PR.
- No release readiness claim is made by this baseline.
- Initial code is not treated as authoritative current FUNKY specification without human review.
