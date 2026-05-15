import {
  estimateTierSyncGas,
  getMilestoneTier,
  getNextTierDays,
  resolveTierSyncCall,
  sendTierSyncTransaction,
  TIER_REASON_CODES,
  VALID_TIER_DAYS
} from '../tierSync';

const userAddress = '0x0000000000000000000000000000000000000001';
const batchId = '0x' + '1'.repeat(64);

describe('tierSync', () => {
  it('maps holding days to the fixed contract tiers', () => {
    expect(VALID_TIER_DAYS).toEqual([0, 31, 91, 181, 271, 361, 541, 721]);
    expect(getMilestoneTier(0)).toBe(0);
    expect(getMilestoneTier(30)).toBe(0);
    expect(getMilestoneTier(31)).toBe(31);
    expect(getMilestoneTier(90)).toBe(31);
    expect(getMilestoneTier(91)).toBe(91);
    expect(getMilestoneTier(180)).toBe(91);
    expect(getMilestoneTier(181)).toBe(181);
    expect(getMilestoneTier(270)).toBe(181);
    expect(getMilestoneTier(271)).toBe(271);
    expect(getMilestoneTier(360)).toBe(271);
    expect(getMilestoneTier(361)).toBe(361);
    expect(getMilestoneTier(540)).toBe(361);
    expect(getMilestoneTier(541)).toBe(541);
    expect(getMilestoneTier(720)).toBe(541);
    expect(getMilestoneTier(721)).toBe(721);
  });

  it('returns the next valid tier boundary', () => {
    expect(getNextTierDays(0)).toBe(31);
    expect(getNextTierDays(31)).toBe(91);
    expect(getNextTierDays(541)).toBe(721);
    expect(getNextTierDays(721)).toBeNull();
  });

  it('uses regular sync for same-tier and upgrade updates', () => {
    expect(resolveTierSyncCall(31, 91)).toEqual({
      method: 'syncHoldingDate',
      reasonName: 'REGULAR_SYNC',
      reasonCode: TIER_REASON_CODES.REGULAR_SYNC
    });
    expect(resolveTierSyncCall(91, 91).method).toBe('syncHoldingDate');
  });

  it('uses explicit zero-balance reset reason for stale non-zero contract tiers', () => {
    expect(resolveTierSyncCall(181, 0, { tokenBalance: 0, holdingDays: 0 })).toEqual({
      method: 'syncHoldingDateWithReason',
      reasonName: 'ZERO_BALANCE_RESET',
      reasonCode: TIER_REASON_CODES.ZERO_BALANCE_RESET
    });
  });

  it('uses weighted-average downgrade reason when balance remains positive', () => {
    expect(resolveTierSyncCall(361, 181, { tokenBalance: 10, holdingDays: 181 })).toEqual({
      method: 'syncHoldingDateWithReason',
      reasonName: 'WEIGHTED_AVERAGE_DOWNGRADE',
      reasonCode: TIER_REASON_CODES.WEIGHTED_AVERAGE_DOWNGRADE
    });
  });

  it('rejects unknown tiers before sending a transaction', () => {
    expect(() => resolveTierSyncCall(0, 180)).toThrow('Invalid tier');
  });

  it('routes gas estimation and transaction send through the safe updater methods', async () => {
    const contract = {
      syncHoldingDate: Object.assign(jest.fn().mockResolvedValue({ hash: '0xRegular' }), {
        estimateGas: jest.fn().mockResolvedValue(111n)
      }),
      syncHoldingDateWithReason: Object.assign(jest.fn().mockResolvedValue({ hash: '0xDowngrade' }), {
        estimateGas: jest.fn().mockResolvedValue(222n)
      })
    };

    await expect(estimateTierSyncGas(contract, userAddress, 31, batchId, 0)).resolves.toBe(111n);
    await sendTierSyncTransaction(contract, userAddress, 31, batchId, 0, {}, { gasLimit: 111n });
    expect(contract.syncHoldingDate).toHaveBeenCalledWith(userAddress, 31, batchId, { gasLimit: 111n });

    await expect(
      estimateTierSyncGas(contract, userAddress, 0, batchId, 181, { tokenBalance: 0, holdingDays: 0 })
    ).resolves.toBe(222n);
    await sendTierSyncTransaction(
      contract,
      userAddress,
      0,
      batchId,
      181,
      { tokenBalance: 0, holdingDays: 0 },
      { gasLimit: 222n }
    );
    expect(contract.syncHoldingDateWithReason).toHaveBeenCalledWith(
      userAddress,
      0,
      TIER_REASON_CODES.ZERO_BALANCE_RESET,
      batchId,
      { gasLimit: 222n }
    );
  });
});
