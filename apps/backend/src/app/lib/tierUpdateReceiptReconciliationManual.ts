import {
  runTierUpdateReceiptReconciliationJob,
  type RunTierUpdateReceiptReconciliationJobInput,
  type RunTierUpdateReceiptReconciliationJobResult
} from './tierUpdateReceiptReconciliationJob';

export type RunManualTierUpdateReceiptReconciliationInput =
  Omit<RunTierUpdateReceiptReconciliationJobInput, 'dryRun'> & {
    dryRun?: boolean;
  };

export type RunManualTierUpdateReceiptReconciliationResult =
  RunTierUpdateReceiptReconciliationJobResult & {
    mode: 'manual';
  };

export const runManualTierUpdateReceiptReconciliation = async (
  input: RunManualTierUpdateReceiptReconciliationInput
): Promise<RunManualTierUpdateReceiptReconciliationResult> => {
  const result = await runTierUpdateReceiptReconciliationJob({
    ...input,
    dryRun: input.dryRun ?? true
  });

  return {
    ...result,
    mode: 'manual'
  };
};
