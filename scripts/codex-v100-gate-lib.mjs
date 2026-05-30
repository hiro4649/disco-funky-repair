#!/usr/bin/env node
// CODEX_QUALITY_HARNESS_FILE v1.0.0
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { HARNESS_VERSION, scanObjectForUnsafe, simpleStatus, writeJsonReport, exitFor, readJson, readText } from './codex-v080-lib.mjs';
import { buildRemoteProductCheckPlan } from './codex-remote-product-checks.mjs';
import { buildRemoteProductEvidenceExecutionReport, buildRemoteProductSafeArtifacts } from './codex-v098-gate-lib.mjs';
import { buildRemoteNpmDiagnosticNormalizationReport } from './codex-v099-gate-lib.mjs';
import { buildSelfTestCaseExportReport } from './codex-self-test-case-export.mjs';

export function parseJson(value) { if (!value) return null; try { return JSON.parse(value); } catch { return { invalidInput: true }; } }
export function parseBool(value) { return value === true || value === '1' || value === 'true' || value === 'yes'; }
function uniq(values) { return [...new Set((values || []).filter(Boolean))]; }
function any(input, keys) { return keys.some((key) => parseBool(input[key])); }
function safe(statusKey, status, payload = {}) {
  const out = simpleStatus(statusKey, status, { ...payload, reasonCodes: uniq(payload.reasonCodes), warnings: uniq(payload.warnings), safeSummaryOnly: true });
  return scanObjectForUnsafe(out).length ? simpleStatus(statusKey, 'fail', { reasonCodes: ['unsafe_value_detected'], safeSummaryOnly: true }) : out;
}
function notApplicable(statusKey, reasonCode) { return safe(statusKey, 'not_applicable', { reasonCodes: [reasonCode] }); }
function hasText(file, pattern) { const text = readText(file) || ''; return typeof pattern === 'string' ? text.includes(pattern) : pattern.test(text); }
function manifestText() { return readText('CODEX_SOURCE_HARNESS_MANIFEST.json') || readText('docs/process/CODEX_HARNESS_MANIFEST.json') || ''; }
function manifestJson() { const file = fs.existsSync('CODEX_SOURCE_HARNESS_MANIFEST.json') ? 'CODEX_SOURCE_HARNESS_MANIFEST.json' : 'docs/process/CODEX_HARNESS_MANIFEST.json'; const parsed = readJson(file); return parsed.ok ? parsed.value : {}; }
function relevant(input, field) { return parseBool(input.forceCheck) || parseBool(input[field]); }
function statusOf(report, key) { return report[key]?.status || report.status || 'missing'; }
function reasonCodesOf(report, key) { return report[key]?.reasonCodes || []; }
function withTemporaryEnv(values, fn) {
  const previous = {};
  for (const key of Object.keys(values)) {
    previous[key] = process.env[key];
    if (values[key] === undefined) delete process.env[key];
    else process.env[key] = String(values[key]);
  }
  try {
    return fn();
  } finally {
    for (const key of Object.keys(values)) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}
const REMOTE_WORKFLOW_POLLUTION_ENV = {
  CODEX_PR_HEAD_SHA: 'dummy_remote_head',
  CODEX_PRODUCT_VERIFICATION_EVIDENCE_PATH: 'dummy',
  CODEX_REMOTE_PRODUCT_BASELINE_PATH: 'dummy',
  CODEX_NPM_TEST_SAFE_SUMMARY_PATH: 'dummy',
  CODEX_REMOTE_NPM_EXECUTED: '1',
  CODEX_NPM_EXIT_CODE: '0',
};
function mapGate(statusKey, reasonCode, input, relevantField, failFields = [], warnFields = []) {
  if (!relevant(input, relevantField)) return notApplicable(statusKey, reasonCode + '_not_applicable');
  const reasonCodes = any(input, failFields) ? [reasonCode] : [];
  const warnings = any(input, warnFields) ? [reasonCode + '_needs_review'] : [];
  return safe(statusKey, reasonCodes.length ? 'fail' : warnings.length ? 'warning' : 'pass', { reasonCodes, warnings });
}
const REQUIRED_PARENT_GATE_KEYS = ['formalEvidencePrecedenceStatus','lifeboatSemanticsStatus','placeholderOnlyEvidenceStatus','remoteNpmDiagnosticNormalizationStatus','legacySelfTestAdvisoryStatus','targetQualityBlockerDigestStatus','prEvidenceAutoRepairHintStatus','actionsBlockerRecoveryStatus','sameHeadEvidenceRefreshStatus','safeArtifactBundleCompletenessStatus','productEvidenceConsumptionStatus','placeholderEvidenceForbiddenStatus','sameHeadArtifactEvidenceStatus','skipNpmProductBypassStatus'];

export function buildParentHarnessDevelopmentReport(input = parseJson(process.env.CODEX_PARENT_HARNESS_DEVELOPMENT_JSON) || {}) { const reasonCodes = []; const parentVersion = String(input.parentVersion || '0.9.9'); const childVersion = String(input.childVersion || HARNESS_VERSION); if (parentVersion !== '0.9.9' || childVersion !== '1.0.0' || input.parentVersion === '') reasonCodes.push('parent_harness_required'); if (!fs.existsSync('scripts/codex-v099-self-test.mjs') || parseBool(input.parentSelfTestNotRun)) reasonCodes.push('parent_harness_self_test_failed'); if (any(input, ['newHarnessOnlyJudgement','v099GateWeakened','targetRolloutBeforeSourceMainVerification'])) reasonCodes.push('parent_gate_preservation_failed'); return safe('parentHarnessDevelopmentStatus', reasonCodes.length ? 'fail' : 'pass', { reasonCodes, parentVersion, childVersion }); }
export function buildParentHarnessSelfTestReport(input = parseJson(process.env.CODEX_PARENT_HARNESS_SELF_TEST_JSON) || {}) { const reasonCodes = []; if (!fs.existsSync('scripts/codex-v099-self-test.mjs') || !hasText('scripts/codex-local-quality-gate.mjs', 'v099SelfTestStatus')) reasonCodes.push('parent_harness_self_test_failed'); if (any(input, ['activeParentFailure','parentActiveSelfTestRegistryMissing','legacyFailureBlockingActive','activeFailureAdvisory'])) reasonCodes.push('parent_harness_self_test_failed'); return safe('parentHarnessSelfTestStatus', reasonCodes.length ? 'fail' : 'pass', { reasonCodes, requiredSelfTestCount: 9 }); }
export function buildNewHarnessSelfTestReport(input = parseJson(process.env.CODEX_NEW_HARNESS_SELF_TEST_JSON) || {}) { const reasonCodes = []; const manifest = manifestText(); if (!fs.existsSync('scripts/codex-v100-self-test.mjs') || parseBool(input.v100SelfTestMissing)) reasonCodes.push('new_harness_self_test_failed'); if (!hasText('scripts/codex-local-quality-gate.mjs', 'v100SelfTestStatus') || parseBool(input.v100StatusKeyMissing)) reasonCodes.push('new_harness_self_test_failed'); if (!fs.existsSync('docs/process/CODEX_V100_EVAL_CASES.json') || parseBool(input.v100EvalCasesMissing)) reasonCodes.push('new_harness_self_test_failed'); if (!manifest.includes('codex-v100-self-test.mjs') || parseBool(input.v100FilesMissingFromManifest)) reasonCodes.push('new_harness_self_test_failed'); if (parseBool(input.v100LocalQualityGateIntegrationMissing)) reasonCodes.push('new_harness_self_test_failed'); return safe('newHarnessSelfTestStatus', reasonCodes.length ? 'fail' : 'pass', { reasonCodes }); }
export function buildParentGatePreservationReport(input = parseJson(process.env.CODEX_PARENT_GATE_PRESERVATION_JSON) || {}) { const reasonCodes = []; const localGateText = readText('scripts/codex-local-quality-gate.mjs') || ''; for (const key of REQUIRED_PARENT_GATE_KEYS) if (!localGateText.includes(key)) reasonCodes.push('parent_gate_preservation_failed'); if (any(input, ['formalEvidenceFailPass','lifeboatOnlyPass','placeholderOnlyProductEvidencePass','npmFailurePass','workflowDispatchPrEvidence','sameHeadMismatchHidden','remoteInfraAsProduct','productFailureAsRemoteInfra','parentGateFileRemoved'])) reasonCodes.push('parent_gate_preservation_failed'); return safe('parentGatePreservationStatus', reasonCodes.length ? 'fail' : 'pass', { reasonCodes, preservedGateCount: REQUIRED_PARENT_GATE_KEYS.length }); }
export function buildVersionSuccessionReport(input = parseJson(process.env.CODEX_VERSION_SUCCESSION_JSON) || {}) { const reasonCodes = []; const manifest = manifestJson(); const targetMode = process.env.CODEX_HARNESS_MODE === 'target' && fs.existsSync('docs/process/CODEX_HARNESS_MANIFEST.json'); if ((!targetMode && !hasText('README.md', 'Version: v1.0.0')) || manifest.harnessVersion !== '1.0.0' || parseBool(input.manifestReadmeMismatch) || parseBool(input.activeSelfTestVersionMismatch)) reasonCodes.push('version_succession_failed'); if (any(input, ['v099TargetRolloutIncomplete','sourceMainUnverifiedTargetRollout','threeRepoIncompleteNextVersion','skipParentVersion'])) reasonCodes.push('version_succession_failed'); return safe('versionSuccessionStatus', reasonCodes.length ? 'fail' : 'pass', { reasonCodes, parentVersion: '0.9.9', childVersion: '1.0.0' }); }
export function buildWorkflowPlanReport(input = parseJson(process.env.CODEX_WORKFLOW_PLAN_JSON) || {}) { if (!relevant(input, 'workflowRelevant')) return notApplicable('workflowPlanStatus', 'workflow_plan_not_applicable'); const r = any(input, ['largeTaskWithoutDecomposition','productAndHarnessMixed','allowedFilesMissing','forbiddenFilesMissing','doneCriteriaMissing','stopConditionMissing']) ? ['workflow_plan_missing'] : []; return safe('workflowPlanStatus', r.length ? 'fail' : 'pass', { reasonCodes: r, taskMode: input.taskMode || 'harness_change' }); }
export function buildTaskGraphReport(input = parseJson(process.env.CODEX_TASK_GRAPH_JSON) || {}) { if (!relevant(input, 'taskGraphRelevant')) return notApplicable('taskGraphStatus', 'task_graph_not_applicable'); const r = any(input, ['targetBeforeSource','productBeforeHarnessRepair','cycleDetected','missingDependency']) ? ['task_graph_invalid'] : []; return safe('taskGraphStatus', r.length ? 'fail' : 'pass', { reasonCodes: r }); }
export function buildWorkflowScopeReport(input = parseJson(process.env.CODEX_WORKFLOW_SCOPE_JSON) || {}) { const allowed = ['read_only_map','plan_only','safe_cleanup','behavior_preserving_refactor','product_change','security_audit','performance_audit','cost_audit','db_audit','handover','runtime_readiness','harness_change','target_rollout']; const scope = String(input.scope || 'harness_change'); const r = (!allowed.includes(scope) || parseBool(input.scopeUnknown) || parseBool(input.productCodeHarnessMixed)) ? ['workflow_scope_missing'] : []; return safe('workflowScopeStatus', r.length ? 'fail' : 'pass', { reasonCodes: r, scope }); }
export function buildParallelWorkerBudgetReport(input = parseJson(process.env.CODEX_PARALLEL_WORKER_BUDGET_JSON) || {}) { const r = []; const w = []; const ro = Number(input.readOnlyWorkers ?? 0); const ww = Number(input.writeWorkers ?? 0); if (ro > 5 || ww > 1 || Number(input.sameRepoWriteWorkers ?? 0) > 1 || any(input, ['sameBranchMultiWorkerWrite','sameFileMultiWorkerEdit'])) r.push('parallel_worker_budget_exceeded'); if (Number(input.totalWorkers ?? 0) > 5 || parseBool(input.budgetExceeded)) w.push('parallel_worker_budget_manual_review'); return safe('parallelWorkerBudgetStatus', r.length ? 'fail' : w.length ? 'manual_confirmation_required' : 'pass', { reasonCodes: r, warnings: w, readOnlyWorkers: ro, writeWorkers: ww }); }
export function buildBranchIsolationReport(input = parseJson(process.env.CODEX_BRANCH_ISOLATION_JSON) || {}) { if (!relevant(input, 'branchIsolationRelevant')) return notApplicable('branchIsolationStatus', 'branch_isolation_not_applicable'); const r = any(input, ['baseShaMissing','branchMissing','sameBranchMultiWorkerPush','allowedFilesMissing','forbiddenFilesMissing','stopConditionMissing']) ? ['branch_isolation_failed'] : []; return safe('branchIsolationStatus', r.length ? 'fail' : 'pass', { reasonCodes: r }); }
export function buildWorkerFileOwnershipReport(input = parseJson(process.env.CODEX_WORKER_FILE_OWNERSHIP_JSON) || {}) { const r = any(input, ['sameFileTwoWorkers','agentsMultiEdit','qualityGateMultiEdit','manifestMultiEdit','packageOrLockfileChanged']) ? ['worker_file_ownership_conflict'] : []; return safe('workerFileOwnershipStatus', r.length ? 'fail' : 'pass', { reasonCodes: r }); }
export function buildSubagentRoleMatrixReport(input = parseJson(process.env.CODEX_SUBAGENT_ROLE_MATRIX_JSON) || {}) { if (!relevant(input, 'subagentRelevant')) return notApplicable('subagentRoleMatrixStatus', 'subagent_role_matrix_not_applicable'); const r = any(input, ['rawLogOutput','secretOutput','runtimeReadinessClaimedBySubagent']) ? ['subagent_role_matrix_failed'] : []; const w = parseBool(input.requiredRoleMissing) ? ['subagent_role_missing'] : []; return safe('subagentRoleMatrixStatus', r.length ? 'fail' : w.length ? 'warning' : 'pass', { reasonCodes: r, warnings: w }); }
export function buildEvidenceAggregationReport(input = parseJson(process.env.CODEX_EVIDENCE_AGGREGATION_JSON) || {}) { if (!relevant(input, 'evidenceAggregationRelevant')) return notApplicable('evidenceAggregationStatus', 'evidence_aggregation_not_applicable'); const r = any(input, ['headShaMismatch','staleArtifact','formalPlaceholderConflict','lifeboatOnlyPass','missingWorkerEvidence']) ? ['evidence_aggregation_failed'] : []; return safe('evidenceAggregationStatus', r.length ? 'fail' : 'pass', { reasonCodes: r }); }
export function buildMergeSequenceReport(input = parseJson(process.env.CODEX_MERGE_SEQUENCE_JSON) || {}) { if (!relevant(input, 'mergeSequenceRelevant')) return notApplicable('mergeSequenceStatus', 'merge_sequence_not_applicable'); const r = any(input, ['targetBeforeSource','funkyBeforeIris','rendererBeforeFunky','remotePassMissingMerge','productBeforeTargetRollout']) ? ['merge_sequence_violation'] : []; return safe('mergeSequenceStatus', r.length ? 'fail' : 'pass', { reasonCodes: r }); }
export function buildWorkflowStopConditionReport(input = parseJson(process.env.CODEX_WORKFLOW_STOP_CONDITION_JSON) || {}) { const r = any(input, ['productFileMixed','runtimeReadinessClaimed','productionReadinessClaimed','packageOrLockfileChanged','sameHeadMismatch','remoteQualityGateFail','safeArtifactMissing','actionsBlockerUnresolved','stalePrBody','branchConflict','forbiddenFileChange']) ? ['workflow_stop_condition_triggered'] : []; return safe('workflowStopConditionStatus', r.length ? 'fail' : 'pass', { reasonCodes: r }); }
export function buildWorkflowResumeReport(input = parseJson(process.env.CODEX_WORKFLOW_RESUME_JSON) || {}) { if (!relevant(input, 'resumeRelevant')) return notApplicable('workflowResumeStatus', 'workflow_resume_not_applicable'); const r = any(input, ['resumePointMissing','blindRerunRecommended','productFailureBodyOnly','infraFailureProductFailure','staleHeadRerunRecommended']) ? ['workflow_resume_invalid'] : []; return safe('workflowResumeStatus', r.length ? 'fail' : 'pass', { reasonCodes: r, resumePoint: input.resumePoint || 'next_safe_step' }); }
export function buildWorkflowCostBudgetReport(input = parseJson(process.env.CODEX_WORKFLOW_COST_BUDGET_JSON) || {}) { const r = any(input, ['unboundedSubagents','prBodyTooLarge','artifactCountExceeded']) ? ['workflow_cost_budget_exceeded'] : []; const w = (parseBool(input.budgetExceeded) || Number(input.workerCount ?? 0) > 5 || Number(input.rerunCount ?? 0) > 3) ? ['workflow_cost_budget_manual_required'] : []; return safe('workflowCostBudgetStatus', r.length ? 'fail' : w.length ? 'manual_confirmation_required' : 'pass', { reasonCodes: r, warnings: w }); }
export function buildCodebaseMapReport(input = parseJson(process.env.CODEX_CODEBASE_MAP_JSON) || {}) { return mapGate('codebaseMapStatus', 'codebase_map_failed', input, 'codebaseMapRelevant', ['entrypointMissing','moduleOwnerMissing','generatedSourceMixed']); }
export function buildEntrypointMapReport(input = parseJson(process.env.CODEX_ENTRYPOINT_MAP_JSON) || {}) { return mapGate('entrypointMapStatus', 'entrypoint_map_failed', input, 'entrypointMapRelevant', ['testHelperRuntimeEntry'], ['runtimeEntryMissing']); }
export function buildModuleBoundaryReport(input = parseJson(process.env.CODEX_MODULE_BOUNDARY_JSON) || {}) { return mapGate('moduleBoundaryStatus', 'module_boundary_violation', input, 'moduleBoundaryRelevant', ['coreDirectExternalApi','boundaryViolation']); }
export function buildDependencyGraphReport(input = parseJson(process.env.CODEX_DEPENDENCY_GRAPH_JSON) || {}) { return mapGate('dependencyGraphStatus', 'dependency_graph_failed', input, 'dependencyGraphRelevant', ['dynamicImportUnusedConfirmed','prodDevDependencyMixed'], ['cycleDetected']); }
export function buildDataFlowMapReport(input = parseJson(process.env.CODEX_DATA_FLOW_MAP_JSON) || {}) { return mapGate('dataFlowMapStatus', 'data_flow_map_failed', input, 'dataFlowRelevant', ['writePathMissing'], ['externalSideEffectUnknown','retryUnknown','timeoutUnknown','idempotencyUnknown']); }
export function buildApiSurfaceMapReport(input = parseJson(process.env.CODEX_API_SURFACE_MAP_JSON) || {}) { return mapGate('apiSurfaceMapStatus', 'api_surface_map_failed', input, 'apiSurfaceRelevant', ['adminEndpointWithoutAuth','authRequiredUnknown']); }
export function buildDbUsageMapReport(input = parseJson(process.env.CODEX_DB_USAGE_MAP_JSON) || {}) { return mapGate('dbUsageMapStatus', 'db_usage_raw_rows_forbidden', input, 'dbUsageRelevant', ['productionDbConnected','rawRowsOutput','migrationWithoutRollback','migrationAutoApplied']); }
export function buildWorkerBatchMapReport(input = parseJson(process.env.CODEX_WORKER_BATCH_MAP_JSON) || {}) { return mapGate('workerBatchMapStatus', 'worker_batch_timeout_missing', input, 'workerBatchRelevant', ['externalSideEffectNoOwnership'], ['cronWithoutTimeout','retryUnknown','idempotencyUnknown']); }
export function buildExternalIntegrationMapReport(input = parseJson(process.env.CODEX_EXTERNAL_INTEGRATION_MAP_JSON) || {}) { return mapGate('externalIntegrationMapStatus', 'external_integration_secret_exposure', input, 'externalIntegrationRelevant', ['endpointValuePrinted','tokenValuePrinted','secretValuePrinted']); }
export function buildSecuritySurfaceMapReport(input = parseJson(process.env.CODEX_SECURITY_SURFACE_MAP_JSON) || {}) { return mapGate('securitySurfaceMapStatus', 'security_surface_failed', input, 'securitySurfaceRelevant', ['secretExposure','actualAuthChangeQueryOnly','adminEndpointUnclassified','rawLogExposure']); }
export function buildPerformanceHotspotMapReport(input = parseJson(process.env.CODEX_PERFORMANCE_HOTSPOT_MAP_JSON) || {}) { return mapGate('performanceHotspotMapStatus', 'performance_hotspot_claim_unproven', input, 'performanceRelevant', ['improvementClaimWithoutProfile'], ['nPlusOneCandidate','bundleBloatCandidate','unboundedLoopCandidate']); }
export function buildServiceCostMapReport(input = parseJson(process.env.CODEX_SERVICE_COST_MAP_JSON) || {}) { return mapGate('serviceCostMapStatus', 'service_cost_claim_unproven', input, 'costRelevant', ['savingsClaimWithoutBilling'], ['pollingCostCandidate','retryStormCandidate','artifactRetentionCandidate']); }
export function buildDeadCodeCandidateReport(input = parseJson(process.env.CODEX_DEAD_CODE_CANDIDATE_JSON) || {}) { return mapGate('deadCodeCandidateStatus', 'dead_code_unconfirmed_delete_forbidden', input, 'deadCodeRelevant', ['inferredDeleted','dynamicImportConfirmedUnused','unknownDeleted']); }
export function buildTestGapMapReport(input = parseJson(process.env.CODEX_TEST_GAP_MAP_JSON) || {}) { return mapGate('testGapMapStatus', 'test_gap_unresolved', input, 'testGapRelevant', ['runtimeReadinessFromTestsOnly'], ['productChangeWithoutTest']); }
export function buildDocsImplementationDriftReport(input = parseJson(process.env.CODEX_DOCS_IMPLEMENTATION_DRIFT_JSON) || {}) { return mapGate('docsImplementationDriftStatus', 'docs_implementation_conflict', input, 'docsDriftRelevant', ['docsImplementationConflictHidden','docsTreatedAsAlwaysSource']); }
export function buildArchitectureBlueprintReport(input = parseJson(process.env.CODEX_ARCHITECTURE_BLUEPRINT_JSON) || {}) { return mapGate('architectureBlueprintStatus', 'handover_document_missing', input, 'architectureBlueprintRelevant', ['assertionWithoutEvidence','blueprintMissing']); }
export function buildConfidenceClassificationReport(input = parseJson(process.env.CODEX_CONFIDENCE_CLASSIFICATION_JSON) || {}) { return mapGate('confidenceClassificationStatus', 'confidence_classification_missing', input, 'confidenceRelevant', ['inferredAsConfirmed','unknownAsDeleteCandidate','conflictHidden']); }
export function buildHandoverDocumentReport(input = parseJson(process.env.CODEX_HANDOVER_DOCUMENT_JSON) || {}) { return mapGate('handoverDocumentStatus', 'handover_document_missing', input, 'handoverRelevant', ['handoverDocsMissing','confidenceClassificationMissing']); }
export function buildImprovementBacklogReport(input = parseJson(process.env.CODEX_IMPROVEMENT_BACKLOG_JSON) || {}) { return mapGate('improvementBacklogStatus', 'improvement_backlog_invalid', input, 'improvementBacklogRelevant', ['refactorBehaviorChangeMixed','migrationRuntimeMixed','securityFixCleanupMixed']); }
export function buildSafeCleanupPlanReport(input = parseJson(process.env.CODEX_SAFE_CLEANUP_PLAN_JSON) || {}) { return mapGate('safeCleanupPlanStatus', 'safe_cleanup_plan_failed', input, 'cleanupRelevant', ['deleteWithoutConfirmedUnused','ownerConfirmationMissing']); }
export function buildBehaviorPreservationReport(input = parseJson(process.env.CODEX_BEHAVIOR_PRESERVATION_JSON) || {}) { return mapGate('behaviorPreservationStatus', 'behavior_preservation_failed', input, 'refactorRelevant', ['refactorWithoutTest','publicApiChanged','dbSchemaChangedUndeclared','behaviorChanged']); }
export function buildRefactorSliceReport(input = parseJson(process.env.CODEX_REFACTOR_SLICE_JSON) || {}) { return mapGate('refactorSliceStatus', 'refactor_slice_failed', input, 'refactorSliceRelevant', ['featureAndRefactorMixed','sliceTooLarge']); }
export function buildPublicContractChangeReport(input = parseJson(process.env.CODEX_PUBLIC_CONTRACT_CHANGE_JSON) || {}) { return mapGate('publicContractChangeStatus', 'public_contract_change_unstated', input, 'publicContractRelevant', ['breakingChangeUnstated','migrationUnstated','clientImpactUnstated','rollbackMissing']); }
export function buildMigrationSafetyPlanReport(input = parseJson(process.env.CODEX_MIGRATION_SAFETY_PLAN_JSON) || {}) { return mapGate('migrationSafetyPlanStatus', 'migration_safety_plan_failed', input, 'migrationRelevant', ['migrationAutoApplied','compatMissing','backfillMissing','rollbackMissing','downtimeUnknown']); }
export function buildRuntimeReadinessBoundaryReport(input = parseJson(process.env.CODEX_RUNTIME_READINESS_BOUNDARY_JSON) || {}) { const r = []; if (parseBool(input.runtimeReadinessClaimed) && !parseBool(input.runtimeOraclePresent)) r.push('runtime_readiness_boundary_failed'); if (any(input, ['fixturePassRealReady','unitTestPassRealReady','localSmokeRealReady'])) r.push('runtime_readiness_boundary_failed'); return safe('runtimeReadinessBoundaryStatus', r.length ? 'fail' : 'pass', { reasonCodes: r, runtimeReadinessClaimed: parseBool(input.runtimeReadinessClaimed) }); }
export function buildProductionGoBoundaryReport(input = parseJson(process.env.CODEX_PRODUCTION_GO_BOUNDARY_JSON) || {}) { const r = any(input, ['productionReadinessClaimed','productionGoWithoutOwner','productionGoWithoutOracle','harnessAloneProductionGo']) ? ['production_go_boundary_failed'] : []; return safe('productionGoBoundaryStatus', r.length ? 'fail' : 'pass', { reasonCodes: r, productionReadinessClaimed: parseBool(input.productionReadinessClaimed) }); }
export function buildBackendProductRemoteCheckReport(input = parseJson(process.env.CODEX_BACKEND_PRODUCT_REMOTE_CHECK_JSON) || {}) {
  const changed = Array.isArray(input.changedFiles) ? input.changedFiles.join('\n') : String(input.changedFiles || '');
  const env = { ...process.env, CODEX_CHANGED_FILES: changed };
  const plan = buildRemoteProductCheckPlan(input, env);
  const r = [];
  const w = [];
  if (parseBool(input.expectBackendCwd) && !(plan.status === 'pass' && plan.cwd === 'apps/backend' && plan.packageScope === 'apps/backend' && plan.commandClass === 'backend_npm_test' && plan.command === 'npm test -- --runInBand')) r.push('backend_product_cwd_selection_failed');
  if (parseBool(input.expectNoRootNpmWhenRootMissing) && !(plan.rootPackagePresent === false && plan.cwd === 'apps/backend' && plan.commandClass === 'backend_npm_test' && plan.command !== 'npm test')) r.push('backend_product_root_npm_bypass_failed');
  if (parseBool(input.expectCommandScopeMismatch) && !(plan.status === 'fail' && plan.failureClass === 'command_scope_mismatch' && plan.reasonCodes.includes('remote_product_command_scope_mismatch'))) r.push('remote_product_command_scope_mismatch');
  if (parseBool(input.expectBackendEvidenceMetadata)) {
    const artifacts = buildRemoteProductSafeArtifacts({ productRelevant: true, npmExecuted: true, npmExitCode: 0, command: 'npm test -- --runInBand', commandCwd: 'apps/backend', packageScope: 'apps/backend', commandClass: 'backend_npm_test', headSha: 'abc', baseSha: 'def', repository: 'hiro4649/disco-funky-repair', eventName: 'pull_request', isPullRequest: true }, { ...process.env, CODEX_EVENT_NAME: 'pull_request' });
    const command = artifacts.evidence.commands[0] || {};
    if (command.cwd !== 'apps/backend' || command.packageScope !== 'apps/backend' || command.commandClass !== 'backend_npm_test' || artifacts.diagnostic.cwd !== 'apps/backend' || artifacts.diagnostic.packageScope !== 'apps/backend') r.push('backend_remote_evidence_metadata_missing');
  }
  if (parseBool(input.expectPlaceholderOnlyFails)) {
    const report = buildRemoteProductEvidenceExecutionReport({ forceCheck: true, productRelevant: true, isPullRequest: true, targetRepoMode: true, npmExecuted: true, npmExitCode: 0, evidence: { status: 'pending' }, baseline: { status: 'pending' }, diagnostic: { status: 'pending' } });
    if (statusOf(report, 'remoteProductEvidenceExecutionStatus') !== 'fail') r.push('placeholder_only_product_evidence_passed');
  }
  if (parseBool(input.expectFormalEvidenceRequired)) {
    const report = buildRemoteProductEvidenceExecutionReport({ forceCheck: true, productRelevant: true, isPullRequest: true, targetRepoMode: true, skipNpm: false, npmExecuted: false, npmExitCode: 0, evidencePresent: false, baselinePresent: false, diagnosticPresent: false, evidencePath: '', baselinePath: '', diagnosticPath: '' });
    if (statusOf(report, 'remoteProductEvidenceExecutionStatus') !== 'fail') r.push('formal_backend_evidence_not_required');
  }
  if (parseBool(input.expectFormalBackendEvidenceFixtureIgnoresEnv)) {
    const missingFormalReport = withTemporaryEnv(REMOTE_WORKFLOW_POLLUTION_ENV, () => buildRemoteProductEvidenceExecutionReport({
      forceCheck: true,
      productRelevant: true,
      isPullRequest: true,
      targetRepoMode: true,
      skipNpm: false,
      npmExecuted: false,
      npmExitCode: 0,
      evidencePresent: false,
      baselinePresent: false,
      diagnosticPresent: false,
      evidencePath: '',
      baselinePath: '',
      diagnosticPath: '',
    }));
    if (statusOf(missingFormalReport, 'remoteProductEvidenceExecutionStatus') !== 'fail' || !reasonCodesOf(missingFormalReport, 'remoteProductEvidenceExecutionStatus').includes('remote_product_evidence_execution_missing')) r.push('formal_backend_evidence_fixture_env_leak');
  }
  if (parseBool(input.expectFormalBackendEvidenceSupersedesStaleDiagnostic)) {
    const report = buildRemoteNpmDiagnosticNormalizationReport({
      forceCheck: true,
      productRelevant: true,
      headSha: 'abc123',
      npmExecuted: false,
      formalEvidence: {
        status: 'pass',
        normalizedEvidence: {
          headSha: 'abc123',
          commands: [{ required: true, result: 'pass', source: 'remote', cwd: 'apps/backend', packageScope: 'apps/backend', commandClass: 'backend_npm_test' }],
        },
      },
      remoteBaseline: { status: 'pass', result: 'pass', commandCwd: 'apps/backend', packageScope: 'apps/backend', commandClass: 'backend_npm_test' },
      remoteNpmDiagnostic: { status: 'fail', npmExitCode: 0, safeFailureCategory: 'not_executed' },
      diagnosticPendingFinalPass: true,
    });
    if (statusOf(report, 'remoteNpmDiagnosticNormalizationStatus') !== 'pass' || report.remoteNpmDiagnosticNormalizationStatus.npmExecuted !== true) r.push('remote_npm_diagnostic_normalization_failed');
  }
  if (parseBool(input.expectFormalBackendEvidenceSameHeadPassesUnderRemoteEnv)) {
    const report = withTemporaryEnv(REMOTE_WORKFLOW_POLLUTION_ENV, () => buildRemoteNpmDiagnosticNormalizationReport({
      forceCheck: true,
      productRelevant: true,
      currentHeadSha: 'fixture-head',
      evidenceHeadSha: 'fixture-head',
      npmExecuted: false,
      formalEvidence: {
        status: 'pass',
        normalizedEvidence: {
          headSha: 'fixture-head',
          commands: [{ required: true, result: 'pass', source: 'remote', cwd: 'apps/backend', packageScope: 'apps/backend', commandClass: 'backend_npm_test' }],
        },
      },
      remoteBaseline: { status: 'pass', result: 'pass', commandCwd: 'apps/backend', packageScope: 'apps/backend', commandClass: 'backend_npm_test' },
      remoteNpmDiagnostic: { status: 'fail', npmExitCode: 0, safeFailureCategory: 'not_executed' },
      diagnosticPendingFinalPass: true,
    }));
    if (statusOf(report, 'remoteNpmDiagnosticNormalizationStatus') !== 'pass' || report.remoteNpmDiagnosticNormalizationStatus.npmExecuted !== true || report.remoteNpmDiagnosticNormalizationStatus.formalBackendEvidencePass !== true) r.push('formal_backend_evidence_env_isolation_failed');
  }
  if (parseBool(input.expectStaleFormalBackendEvidenceStillBlocks)) {
    const report = buildRemoteNpmDiagnosticNormalizationReport({
      forceCheck: true,
      productRelevant: true,
      headSha: 'newhead',
      npmExecuted: false,
      formalEvidence: {
        status: 'pass',
        normalizedEvidence: {
          headSha: 'oldhead',
          commands: [{ required: true, result: 'pass', source: 'remote', cwd: 'apps/backend', packageScope: 'apps/backend', commandClass: 'backend_npm_test' }],
        },
      },
      remoteBaseline: { status: 'pass', result: 'pass' },
    });
    if (statusOf(report, 'remoteNpmDiagnosticNormalizationStatus') !== 'fail') r.push('same_head_evidence_refresh_failed');
  }
  if (parseBool(input.expectStaleFormalBackendEvidenceExplicitStaleHead)) {
    const report = withTemporaryEnv(REMOTE_WORKFLOW_POLLUTION_ENV, () => buildRemoteNpmDiagnosticNormalizationReport({
      forceCheck: true,
      productRelevant: true,
      currentHeadSha: 'fixture-head',
      evidenceHeadSha: 'stale-head',
      npmExecuted: false,
      formalEvidence: {
        status: 'pass',
        normalizedEvidence: {
          headSha: 'stale-head',
          commands: [{ required: true, result: 'pass', source: 'remote', cwd: 'apps/backend', packageScope: 'apps/backend', commandClass: 'backend_npm_test' }],
        },
      },
      remoteBaseline: { status: 'pass', result: 'pass', commandCwd: 'apps/backend', packageScope: 'apps/backend', commandClass: 'backend_npm_test' },
      remoteNpmDiagnostic: { status: 'fail', npmExitCode: 0, safeFailureCategory: 'not_executed' },
    }));
    if (statusOf(report, 'remoteNpmDiagnosticNormalizationStatus') !== 'fail' || !reasonCodesOf(report, 'remoteNpmDiagnosticNormalizationStatus').includes('same_head_evidence_refresh_failed')) r.push('same_head_evidence_refresh_failed');
  }
  if (parseBool(input.expectFormalBackendEvidenceMissingStillFails)) {
    const report = withTemporaryEnv(REMOTE_WORKFLOW_POLLUTION_ENV, () => buildRemoteProductEvidenceExecutionReport({
      forceCheck: true,
      productRelevant: true,
      isPullRequest: true,
      targetRepoMode: true,
      skipNpm: false,
      npmExecuted: false,
      npmExitCode: 0,
      evidencePresent: false,
      baselinePresent: false,
      diagnosticPresent: false,
      evidencePath: '',
      baselinePath: '',
      diagnosticPath: '',
    }));
    if (statusOf(report, 'remoteProductEvidenceExecutionStatus') !== 'fail' || !reasonCodesOf(report, 'remoteProductEvidenceExecutionStatus').includes('remote_product_evidence_execution_missing')) r.push('formal_backend_evidence_missing_not_blocking');
  }
  if (parseBool(input.expectLegacyTargetSelfTestsAdvisory)) {
    const localGateText = readText('scripts/codex-local-quality-gate.mjs') || '';
    if (!localGateText.includes('normalizeLegacySelfTestAdvisories') || !localGateText.includes('advisoryClass') || !localGateText.includes('legacy_self_test')) r.push('legacy_self_test_advisory_failed');
    if (!localGateText.includes('ACTIVE_SELF_TEST_STATUS_KEY') || !localGateText.includes('v099SelfTestStatus')) r.push('legacy_self_test_advisory_failed');
  }
  if (parseBool(input.expectV100SelfTestCaseIdExport)) {
    const report = buildSelfTestCaseExportReport({
      CODEX_SELF_TEST_REPORT_JSON: JSON.stringify({
        status: 'fail',
        suite: 'v100',
        caseCount: 1,
        failedCaseCount: 1,
        cases: [{ id: 'safe_case_id', status: 'fail', actualStatus: 'fail', reasonCodes: ['safe_reason'] }],
      }),
    });
    const failedCase = report.selfTestCaseExportStatus.failedCases[0] || {};
    if (statusOf(report, 'selfTestCaseExportStatus') !== 'pass' || failedCase.caseId !== 'safe_case_id') r.push('self_test_failed_case_export_missing');
    const expectedFailureReport = buildSelfTestCaseExportReport({
      CODEX_SELF_TEST_REPORT_JSON: JSON.stringify({
        status: 'pass',
        suite: 'v100',
        caseCount: 1,
        failedCaseCount: 0,
        cases: [{ id: 'expected_failure_case', status: 'pass', expectedStatus: 'fail', actualStatus: 'fail', reasonCodes: ['safe_reason'] }],
      }),
    });
    if (expectedFailureReport.selfTestCaseExportStatus.failedCases.length !== 0) r.push('self_test_failed_case_export_missing');
  }
  if (parseBool(input.expectActiveV100FailureBlocks) && statusOf(buildNewHarnessSelfTestReport({ v100SelfTestMissing: true }), 'newHarnessSelfTestStatus') !== 'fail') r.push('active_v100_failure_not_blocking');
  if (parseBool(input.expectParentV099Preservation) && (statusOf(buildParentHarnessSelfTestReport({}), 'parentHarnessSelfTestStatus') !== 'pass' || statusOf(buildParentGatePreservationReport({}), 'parentGatePreservationStatus') !== 'pass')) r.push('parent_v099_preservation_failed');
  return safe('backendProductRemoteCheckStatus', r.length ? 'fail' : w.length ? 'warning' : 'pass', { reasonCodes: r, warnings: w, plan });
}
export function runV100GateCli(metaUrl, argvOne, builder, envName) { if (argvOne && fileURLToPath(metaUrl) === argvOne) { const report = builder(); writeJsonReport(report, envName); exitFor(report); } }
