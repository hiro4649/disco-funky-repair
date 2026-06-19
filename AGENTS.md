# AGENTS.md

## disco-funky-repair Working Guide

This repository is the FUNKY repair workspace. Normal work must stay inside the
owner-approved scope and should preserve backend/D8, staging, and runtime
boundaries unless explicitly authorized.

Package metadata and verification entrypoints may vary by subproject. Before
choosing commands, inspect the relevant package or tool metadata for the touched
area and run the smallest meaningful check that already exists. Do not invent
commands, install dependencies, or claim verification passed when dependencies
or scripts are unavailable.

Do not claim staging no-tx PASS, runtime readiness, production readiness,
deployment readiness, backend/D8 readiness, or product repair completion unless
the owner explicitly scopes that evidence. Done means changed files are scoped,
verification is evidence-based or honestly unavailable, and no raw logs or
secret-like output are exposed.

<!-- CODEX_QUALITY_HARNESS_BEGIN -->
CODEX_QUALITY_HARNESS_FILE v1.2.7

## Prime Directive

Ship the smallest correct change that increases product value without weakening
truth, trust, security, or maintainability.

This AGENTS.md is a compact doctrine and routing map; detailed policy lives in
docs/process.

## Active Harness

Active target harness: v1.2.7 / v127.
Read first: AGENTS.md, docs/process/CODEX_HARNESS_MANIFEST.json,
docs/process/CODEX_V127_SPEC.md, and docs/process/CODEX_ACTIVE_POLICY_INDEX.json.
README, legacy specs, and PR history are conditional reads only.

## Authority

v1.1.8 Final Decision remains final authority.
v1.1.9 P0 artifacts and operator-visible statuses remain preserved.
v1.2.0 adaptive routing, v1.2.1 calibration, v1.2.2 read-budget routing,
and v1.2.3 observed evidence/decision closure remain compatibility layers.
v1.2.4 specialist-governance fields remain compatibility layers.
v1.2.5 adds Goal Shard, Worktree Fleet, Evidence Lane, Typed Monitor Inbox, Fanout Guard, and Yield fields. v1.2.6 adds observed-state loops. v1.2.7 adds receipt-carried continuation and evidence compression inside the existing P0 artifacts.

## Target Footprint

Do not add new P0 artifacts, top-level statuses, skills, workflow behavior,
product code, package or lockfile changes, runtime code, or readiness claims
for harness rollout unless separately scoped by the owner.
Target AGENTS.md is a compact routing map. Put detailed policy in docs/process
and use profile IDs instead of repeated forbidden-scope text.

## Safety Boundary

Use safe artifacts only. Do not read raw logs. Do not use 8-session.
Do not access wallet/RPC/deploy/secrets, submit GitHub approval review,
self-approve, release, publish, BscScan verify, or claim runtime, production,
legal, or YouTube policy compliance.
Expert agents may make technical findings and one safe next action inside the
goal scope; they cannot create owner authority or widen product/runtime/package
scope. Skeptic review is abnormal-condition only. Safe session learning is
proposal-only and owner-approval-required.

## Local Task Discipline

Start from clean default branch or clean worktree. Preserve user changes.
Run v125 self-test and the local quality gate for harness rollout. For product
work, use the repo-specific commands above and keep product evidence separate
from harness evidence.
<!-- CODEX_QUALITY_HARNESS_END -->
