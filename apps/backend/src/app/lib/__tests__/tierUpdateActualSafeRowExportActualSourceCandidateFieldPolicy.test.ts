import { readFileSync } from 'fs';
import { join } from 'path';

import {
  buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy
} from '../tierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy';
import {
  TIER_UPDATE_SAFE_DB_READ_EXPORT_ALLOWED_ENTITIES,
  TIER_UPDATE_SAFE_DB_READ_EXPORT_DEFERRED_ENTITIES,
  TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST,
  TIER_UPDATE_SAFE_DB_READ_EXPORT_MAX_ROW_LIMIT
} from '../tierUpdateSafeDbReadExport';

const sourceHeadSha = '1234567890abcdef1234567890abcdef12345678';

const baseInput = () => ({
  policyId: 'd8ar-field-policy-boundary',
  sourceHeadSha,
  policyMode: 'field_policy_only',
  requestedEntities: [...TIER_UPDATE_SAFE_DB_READ_EXPORT_ALLOWED_ENTITIES],
  canonicalAllowlistRequired: true,
  fieldClassificationCompleteRequired: true,
  rawValueDefaultDenied: true,
  boundedRowPolicyRequired: true,
  stableSortPolicyRequired: true,
  sameHeadRequirementPreserved: true,
  futureOwnerApprovalRequired: true
});

const indexPolicies = <T extends { sourceField: string }>(entries: readonly T[] = []): Record<string, T> =>
  Object.fromEntries(entries.map((entry) => [entry.sourceField, entry]));

describe('buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy', () => {
  it('returns a ready field-policy boundary without claiming actual source access', () => {
    const result = buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy(baseInput());

    expect(result.status).toBe('ACTUAL_SOURCE_CANDIDATE_FIELD_POLICY_READY');
    expect(result.kind).toBe('tier_update_actual_safe_row_export_actual_source_candidate_field_policy');
    expect(result.traceLabel).toBe('d8ar_actual_safe_row_export_actual_source_candidate_field_policy');
    expect(result.schemaVersion).toBe(1);
    expect(result.skillProfileId).toBe('FUNKY_NO_TX_NO_RUNTIME_PROFILE');
    expect(result.safeSummaryOnly).toBe(true);
    expect(result.contractOnly).toBe(true);
    expect(result.noActualAccess).toBe(true);
    expect(result.implementationConformanceClaimed).toBe(false);
    expect(result.hardMaxRowsPerEntity).toBe(TIER_UPDATE_SAFE_DB_READ_EXPORT_MAX_ROW_LIMIT);
    expect(result.rowIdPolicy).toBe('sha256_source_identity_v1');
    expect(result.sourceHashPolicy).toBe('sha256_canonical_safe_projection_v1');
    expect(result.nextSafeAction).toBe('prepare_pr_d8as_actual_source_candidate_redaction_contract');
    expect(result.runtimeReadinessClaimed).toBe(false);
    expect(result.productionReadinessClaimed).toBe(false);
    expect(result.stagingNoTxPassClaimed).toBe(false);
    expect(Object.values(result.boundarySummary).every((value) => value === false)).toBe(true);
  });

  it('covers the canonical entities and fields exactly once', () => {
    const result = buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy(baseInput());
    const canonicalFieldCount = Object.values(TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST)
      .reduce((sum, fields) => sum + fields.length, 0);

    expect(result.allowedEntities).toEqual([
      'scheduled_tier_update',
      'job_run',
      'tx_receipt_evidence',
      'staging_evidence'
    ]);
    expect(result.allowedEntities).toEqual(TIER_UPDATE_SAFE_DB_READ_EXPORT_ALLOWED_ENTITIES);
    expect(result.deferredEntities).toEqual(TIER_UPDATE_SAFE_DB_READ_EXPORT_DEFERRED_ENTITIES);
    expect(result.fieldCoverageSummary).toEqual({
      entityCount: 4,
      canonicalFieldCount,
      classifiedFieldCount: canonicalFieldCount,
      missingClassificationCount: 0,
      extraClassificationCount: 0,
      duplicateClassificationCount: 0,
      safeSummaryOnly: true
    });

    for (const entity of TIER_UPDATE_SAFE_DB_READ_EXPORT_ALLOWED_ENTITIES) {
      expect(result.canonicalFieldsByEntity[entity]).toEqual(TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST[entity]);
      expect((result.fieldPoliciesByEntity[entity] ?? []).map((entry) => entry.sourceField))
        .toEqual(TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST[entity]);
    }
  });

  it('classifies sensitive scheduled tier update fields as summaries or derived values', () => {
    const result = buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy(baseInput());
    const scheduled = indexPolicies(result.fieldPoliciesByEntity.scheduled_tier_update);

    expect(scheduled.id).toMatchObject({ handling: 'derived_audit_identifier', targetSafeField: 'row_id', rawSourceValueEmissionAllowed: false });
    expect(scheduled.userId).toMatchObject({ handling: 'masked_identity_summary', rawSourceValueEmissionAllowed: false });
    expect(scheduled.txHash).toMatchObject({ handling: 'public_chain_hash_summary', publicChainEvidence: true, rawSourceValueEmissionAllowed: false });
    expect(scheduled.txContractAddress).toMatchObject({ handling: 'public_chain_address_summary', rawSourceValueEmissionAllowed: false });
    expect(scheduled.txFrom).toMatchObject({ handling: 'public_chain_address_summary', rawSourceValueEmissionAllowed: false });
    expect(scheduled.txTo).toMatchObject({ handling: 'public_chain_address_summary', rawSourceValueEmissionAllowed: false });
    expect(scheduled.safeSummary).toMatchObject({ handling: 'safe_json_summary', rawSourceValueEmissionAllowed: false });
    expect(scheduled.expectedTier.constraints).toEqual([0, 30, 180, 360, 720]);
    expect(scheduled.currentTier.constraints).toEqual([0, 30, 180, 360, 720]);
    expect(scheduled.txChainId.constraints).toEqual([56, 97, null]);
    expect(scheduled.txReceiptStatus.constraints).toEqual([0, 1, null]);
  });

  it('classifies job, receipt, and staging policy fields without source-row disclosure', () => {
    const result = buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy(baseInput());

    const job = indexPolicies(result.fieldPoliciesByEntity.job_run);
    const receipt = indexPolicies(result.fieldPoliciesByEntity.tx_receipt_evidence);
    const staging = indexPolicies(result.fieldPoliciesByEntity.staging_evidence);

    expect(job.id).toMatchObject({ handling: 'derived_audit_identifier', rawSourceValueEmissionAllowed: false });
    expect(job.runKey).toMatchObject({ handling: 'hash_summary', rawSourceValueEmissionAllowed: false });
    expect(job.lockedBy).toMatchObject({ handling: 'masked_identity_summary', rawSourceValueEmissionAllowed: false });
    expect(receipt.txHash).toMatchObject({ handling: 'public_chain_hash_summary', rawSourceValueEmissionAllowed: false });
    expect(receipt.confirmationDepth).toMatchObject({ handling: 'bounded_integer', rawSourceValueEmissionAllowed: true });
    expect(receipt.resumeKey).toMatchObject({ handling: 'hash_summary', rawSourceValueEmissionAllowed: false });
    expect(staging.stagingNoTxPreflightStatus.constraints).toEqual(['BLOCKED']);
    expect(staging.readinessClaim.constraints).toEqual(['none']);
    expect(staging.safeOutputOnly.constraints).toEqual([true]);
  });

  it('keeps stable sort fields bounded to canonical fields or safe audit metadata', () => {
    const result = buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy(baseInput());
    const auditFields = new Set(['audit_export_id']);

    for (const entity of TIER_UPDATE_SAFE_DB_READ_EXPORT_ALLOWED_ENTITIES) {
      for (const sortField of result.stableSortPolicyByEntity[entity] ?? []) {
        expect([
          ...TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST[entity],
          ...auditFields
        ]).toContain(sortField);
      }
    }
  });

  it.each([
    ['Prize'],
    ['prize'],
    ['PrizeTransactions'],
    ['nft_metadata'],
    ['token_detail'],
    ['ticket_code'],
    ['unknown_entity']
  ])('blocks unsupported or deferred entity %s', (entity) => {
    const result = buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy({
      ...baseInput(),
      requestedEntities: ['scheduled_tier_update', entity, 'tx_receipt_evidence', 'staging_evidence']
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('remove_deferred_or_unknown_entity');
    expect(result.fieldPoliciesByEntity).toEqual({});
  });

  it('requires exact canonical entity order while sending safe subsets to review', () => {
    const subset = buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy({
      ...baseInput(),
      requestedEntities: ['scheduled_tier_update', 'job_run']
    });
    const wrongOrder = buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy({
      ...baseInput(),
      requestedEntities: ['job_run', 'scheduled_tier_update', 'tx_receipt_evidence', 'staging_evidence']
    });

    expect(subset.status).toBe('NEEDS_REVIEW');
    expect(subset.needsReviewReasons).toContain('safe_subset_requested');
    expect(wrongOrder.status).toBe('BLOCKED');
    expect(wrongOrder.blockers).toContain('requested_entities_wrong_order');
  });

  it.each([
    'canonicalAllowlistRequired',
    'fieldClassificationCompleteRequired',
    'rawValueDefaultDenied',
    'boundedRowPolicyRequired',
    'stableSortPolicyRequired',
    'sameHeadRequirementPreserved',
    'futureOwnerApprovalRequired'
  ])('blocks when required acknowledgement %s is missing or false', (key) => {
    const input = { ...baseInput(), [key]: false };
    const result = buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy(input);

    expect(result.status).toBe('BLOCKED');
    expect(result.blockers).toContain(`${key}_required`);
  });

  it.each([
    'actualRows',
    'rawRows',
    'dbRows',
    'sourceRows',
    'records',
    'jsonlLines',
    'filePath',
    'outputPath',
    'artifactName',
    'sql',
    'query',
    'rawPayload',
    'endpoint',
    'prisma',
    'databaseClient',
    'readOnlySource',
    'fieldPolicies',
    'allowedFieldsByEntity'
  ])('blocks forbidden source/access override property %s', (key) => {
    const result = buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy({
      ...baseInput(),
      [key]: null
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.nextSafeAction).toBe('remove_forbidden_actual_source_policy_input');
    expect(result.blockers).toContain(`forbidden_input_property:${key}`);
  });

  it.each([
    'actualDbQueryEnabled',
    'realDbQueryEnabled',
    'actualDbExportEnabled',
    'sourceAccessEnabled',
    'sourceAdapterExecutionEnabled',
    'readOnlySourceInvocationEnabled',
    'prismaClientEnabled',
    'databaseUrlReadEnabled',
    'envReadEnabled',
    'networkAccessEnabled',
    'rpcAccessEnabled',
    'walletAccessEnabled',
    'contractAccessEnabled',
    'txSendEnabled',
    'fileExportEnabled',
    'jsonlFileWriteEnabled',
    'artifactUploadEnabled',
    'dockerSmokeChanged',
    'stagingNoTxPassClaimed',
    'runtimeReadinessClaimed',
    'productionReadinessClaimed'
  ])('blocks forbidden boundary flag %s when true', (flag) => {
    const result = buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy({
      ...baseInput(),
      [flag]: true
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.blockers).toContain(`forbidden_boundary_enabled:${flag}`);
  });

  it('redacts arbitrary blocker and review details from output', () => {
    const result = buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy({
      ...baseInput(),
      blockers: ['contains-secret-like-detail'],
      needsReviewReasons: ['safe_subset_requested', 'unsafe-local-path-detail']
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.blockers).toContain('upstream_blocker_present');
    expect(result.blockers.join(' ')).not.toContain('contains-secret-like-detail');
    expect(result.blockers.join(' ')).not.toContain('unsafe-local-path-detail');
  });

  it('does not execute getters and fails closed for accessor input', () => {
    const input = baseInput() as Record<string, unknown>;
    Object.defineProperty(input, 'actualRows', {
      enumerable: true,
      get: () => {
        throw new Error('raw getter executed');
      }
    });

    const result = buildTierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy(input);

    expect(result.status).toBe('BLOCKED');
    expect(result.blockers).toContain('forbidden_input_property:actualRows');
  });

  it('keeps the implementation file free of source access and runtime wiring tokens', () => {
    const source = readFileSync(
      join(__dirname, '../tierUpdateActualSafeRowExportActualSourceCandidateFieldPolicy.ts'),
      'utf8'
    );

    expect(source).not.toMatch(/@prisma\/client|process\.env|DATABASE_URL|from 'fs'|from "fs"|createWriteStream|writeFile|appendFile/);
    expect(source).not.toMatch(/fetch\(|axios|from ['"].*controller|from ['"].*trackingService|main\.ts|jsonlFileWrite\(|writeJsonl|artifact upload/i);
    expect(source).toContain('TIER_UPDATE_SAFE_DB_READ_EXPORT_FIELD_ALLOWLIST');
    expect(source).toContain('TIER_UPDATE_SAFE_DB_READ_EXPORT_ALLOWED_ENTITIES');
  });
});
