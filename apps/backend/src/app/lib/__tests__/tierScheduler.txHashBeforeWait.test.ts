const mockTxHash = `0x${'a'.repeat(64)}`;
const mockBatchId = `0x${'b'.repeat(64)}`;
const mockTierUpdaterContractAddress = '0x0000000000000000000000000000000000000001';
const mockRelayerAddress = '0x0000000000000000000000000000000000000002';
const mockUserWalletAddress = '0x0000000000000000000000000000000000000003';

const mockScheduledTierUpdateFindMany = jest.fn();
const mockScheduledTierUpdateUpdateMany = jest.fn();
const mockScheduledTierUpdateUpsert = jest.fn();
const mockScheduledTierUpdateDeleteMany = jest.fn();
const mockUserFindUnique = jest.fn();
const mockJsonRpcProvider = jest.fn();
const mockWallet = jest.fn();
const mockContract = jest.fn();
const mockCreateTierBatchId = jest.fn();
const mockEstimateTierSyncGas = jest.fn();
const mockSendTierSyncTransaction = jest.fn();
const mockRecordTierUpdateTxSent = jest.fn();
const mockRecordTierUpdateConfirmed = jest.fn();
const mockFindPendingReceiptTierUpdates = jest.fn();
const mockCheckGasPriceSpike = jest.fn();
const mockRecordGasUsage = jest.fn();

jest.mock('../../db/prisma_client', () => ({
    __esModule: true,
    default: {
        scheduledTierUpdate: {
            fields: {
                maxAttempts: 'maxAttemptsFieldRef'
            },
            findMany: mockScheduledTierUpdateFindMany,
            updateMany: mockScheduledTierUpdateUpdateMany,
            upsert: mockScheduledTierUpdateUpsert,
            deleteMany: mockScheduledTierUpdateDeleteMany
        },
        user: {
            findUnique: mockUserFindUnique
        }
    }
}));

jest.mock('../../config/env', () => ({
    QUICKNODE_HTTP_RPC_URL: 'https://rpc.example.invalid',
    TIER_RELAYER_PRIVATE_KEY: `0x${'1'.repeat(64)}`,
    TIER_UPDATER_CONTRACT_ADDRESS: mockTierUpdaterContractAddress
}));

jest.mock('ethers', () => ({
    ethers: {
        JsonRpcProvider: mockJsonRpcProvider,
        Wallet: mockWallet,
        Contract: mockContract,
        id: jest.fn(() => mockBatchId),
        isHexString: jest.fn((value: string, width?: number) => {
            const expectedLength = typeof width === 'number' ? width * 2 : 64;
            return new RegExp(`^0x[a-fA-F0-9]{${expectedLength}}$`).test(value);
        }),
        isAddress: jest.fn((value: string) => /^0x[a-fA-F0-9]{40}$/.test(value))
    }
}));

jest.mock('../walletBalanceMonitor', () => ({
    walletBalanceMonitor: {
        checkGasPriceSpike: mockCheckGasPriceSpike,
        recordGasUsage: mockRecordGasUsage
    }
}));

jest.mock('../discordAlerts', () => ({
    alertContractUpdateFailed: jest.fn()
}));

jest.mock('../tierSync', () => {
    const actual = jest.requireActual('../tierSync');
    return {
        ...actual,
        createTierBatchId: mockCreateTierBatchId,
        estimateTierSyncGas: mockEstimateTierSyncGas,
        sendTierSyncTransaction: mockSendTierSyncTransaction
    };
});

jest.mock('../tierUpdateTxStateService', () => ({
    recordTierUpdateTxSent: mockRecordTierUpdateTxSent,
    recordTierUpdateConfirmed: mockRecordTierUpdateConfirmed,
    findPendingReceiptTierUpdates: mockFindPendingReceiptTierUpdates
}));

const {
    SCHEDULED_TIER_UPDATE_STATUSES
} = require('../tierUpdateState');

const {
    buildScheduledTierUpdateProcessingWhere,
    SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES,
    updateUserContractTier
} = require('../tierScheduler');

const fixedNow = new Date('2026-05-31T00:00:00.000Z');

const buildProvider = () => ({
    getFeeData: jest.fn().mockResolvedValue({
        gasPrice: 2n,
        maxFeePerGas: null,
        maxPriorityFeePerGas: null
    }),
    getBalance: jest.fn().mockResolvedValue(10n ** 18n),
    getNetwork: jest.fn().mockResolvedValue({ chainId: 56n })
});

const buildContract = () => ({
    holdingDate: jest.fn().mockResolvedValue(0)
});

const primeTierUpdateSend = () => {
    const provider = buildProvider();
    const contract = buildContract();
    const txWait = jest.fn().mockResolvedValue({ gasUsed: 21_000n });

    mockJsonRpcProvider.mockImplementation(() => provider);
    mockWallet.mockImplementation(() => ({ address: mockRelayerAddress }));
    mockContract.mockImplementation(() => contract);
    mockCreateTierBatchId.mockReturnValue(mockBatchId);
    mockEstimateTierSyncGas.mockResolvedValue(21_000n);
    mockSendTierSyncTransaction.mockResolvedValue({
        hash: mockTxHash,
        wait: txWait
    });
    mockRecordTierUpdateTxSent.mockResolvedValue({});
    mockUserFindUnique.mockResolvedValue({
        wallet_address: mockUserWalletAddress,
        holdingDate: 31,
        disco_balance: 100,
        held_amount: 31
    });

    return { provider, contract, txWait };
};

describe('tierScheduler txHash-before-wait adoption', () => {
    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(fixedNow);
        jest.clearAllMocks();
        mockScheduledTierUpdateFindMany.mockResolvedValue([]);
        mockScheduledTierUpdateUpdateMany.mockResolvedValue({ count: 1 });
        mockScheduledTierUpdateUpsert.mockResolvedValue({});
        mockScheduledTierUpdateDeleteMany.mockResolvedValue({ count: 0 });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('records TX_SENT evidence after broadcast and before tx.wait', async () => {
        const callOrder: string[] = [];
        const { txWait } = primeTierUpdateSend();

        mockSendTierSyncTransaction.mockImplementation(async () => {
            callOrder.push('broadcast');
            return {
                hash: mockTxHash,
                wait: txWait
            };
        });
        mockRecordTierUpdateTxSent.mockImplementation(async () => {
            callOrder.push('record');
            return {};
        });
        txWait.mockImplementation(async () => {
            callOrder.push('wait');
            return { gasUsed: 21_000n };
        });

        await updateUserContractTier(7, 1, { scheduledTierUpdateId: 42 });

        expect(callOrder).toEqual(['broadcast', 'record', 'wait']);
        expect(mockRecordTierUpdateTxSent).toHaveBeenCalledWith({
            prisma: expect.any(Object),
            scheduledTierUpdateId: 42,
            txHash: mockTxHash,
            txChainId: 56,
            txContractAddress: mockTierUpdaterContractAddress,
            txFrom: mockRelayerAddress,
            txTo: mockUserWalletAddress,
            batchId: mockBatchId,
            sentAt: fixedNow
        });
        expect(mockRecordGasUsage).toHaveBeenCalledWith(21_000n, 42_000n, 'tier_update');
        expect(mockRecordTierUpdateConfirmed).not.toHaveBeenCalled();
        expect(mockFindPendingReceiptTierUpdates).not.toHaveBeenCalled();
    });

    it('does not wait for receipt or retry when TX_SENT evidence cannot be stored', async () => {
        const { txWait } = primeTierUpdateSend();
        mockRecordTierUpdateTxSent.mockRejectedValue(new Error('tx_sent_evidence_failed'));

        await expect(updateUserContractTier(7, 3, { scheduledTierUpdateId: 42 }))
            .rejects.toThrow('tx_sent_evidence_failed');

        expect(mockSendTierSyncTransaction).toHaveBeenCalledTimes(1);
        expect(mockRecordTierUpdateTxSent).toHaveBeenCalledTimes(1);
        expect(txWait).not.toHaveBeenCalled();
        expect(mockRecordGasUsage).not.toHaveBeenCalled();
        expect(mockRecordTierUpdateConfirmed).not.toHaveBeenCalled();
        expect(mockFindPendingReceiptTierUpdates).not.toHaveBeenCalled();
    });

    it('does not retry a scheduled send after tx.wait fails once TX_SENT evidence exists', async () => {
        const { txWait } = primeTierUpdateSend();
        txWait.mockRejectedValue(new Error('receipt_wait_failed'));

        await expect(updateUserContractTier(7, 3, { scheduledTierUpdateId: 42 }))
            .rejects.toThrow('receipt_wait_failed');

        expect(mockSendTierSyncTransaction).toHaveBeenCalledTimes(1);
        expect(mockRecordTierUpdateTxSent).toHaveBeenCalledTimes(1);
        expect(txWait).toHaveBeenCalledTimes(1);
        expect(mockRecordTierUpdateConfirmed).not.toHaveBeenCalled();
        expect(mockFindPendingReceiptTierUpdates).not.toHaveBeenCalled();
    });

    it('keeps TX_SENT and non-pending rows outside the scheduler send query', () => {
        expect(buildScheduledTierUpdateProcessingWhere(fixedNow)).toEqual({
            scheduledAt: {
                lte: new Date('2026-05-31T01:00:00.000Z')
            },
            processed: false,
            status: {
                in: [SCHEDULED_TIER_UPDATE_STATUSES.PENDING]
            }
        });
        expect(SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES).not.toContain(
            SCHEDULED_TIER_UPDATE_STATUSES.TX_SENT
        );
        expect(SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES).not.toContain(
            SCHEDULED_TIER_UPDATE_STATUSES.CONFIRMED
        );
        expect(SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES).not.toContain(
            SCHEDULED_TIER_UPDATE_STATUSES.MANUAL_REVIEW
        );
        expect(SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES).not.toContain(
            SCHEDULED_TIER_UPDATE_STATUSES.CANCELED
        );
    });
});
