# FUNKY Initial Human Source Baseline

## Purpose

This orphan branch stores a sanitized, isolated copy of the user-provided initial human-written FUNKY source for semantic audit against current main.

## Source

- Source type: user-provided initial human-written FUNKY source archives
- Input archives:
  - funky-export.tar.gz
  - Funky-Contracts-main.zip
- Created at: 2026-05-23T10:18:26+09:00
- Created by: Codex
- Current main SHA used for comparison: 48790d92b98ddc7a420006219691aba04e1b2bec
- Baseline branch: audit/funky-initial-human-source-baseline
- Baseline branch head before manifest repair: cad73b68d3039c5e7f6ec5c8f66d302e38e1c370

## Secret Scan Result

- Result: PASS for the sanitized baseline candidate
- Method: repository secret scan plus external baseline grep/regex scan over sanitized files
- Non-blocking note: cookie-handling code references were detected, but no literal secret-like cookie value was found in the baseline candidate

## Excluded Paths And Files

The following were excluded from the baseline candidate before commit:

- .git/
- node_modules/
- dist/
- build/
- .next/
- coverage/
- logs/ and log/
- uploads/
- tmp/
- .idea/
- .env and .env.*
- *.pem, *.p12, *.pfx, *.key
- OS-generated files such as .DS_Store and Thumbs.db
- Unsafe or unsupported symlink: source-export/etc/nginx/funky.fan
- Generated deployed frontend output: source-export/var-www/html/

## Warnings

- Do not merge this branch into main.
- This baseline is for semantic audit only.
- This baseline is not an implementation PR.
- No release readiness claim is made by this baseline.
- Initial code is not treated as authoritative current FUNKY specification without human review.
