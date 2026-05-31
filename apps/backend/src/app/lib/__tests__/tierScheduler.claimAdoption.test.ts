import fs from 'fs';
import path from 'path';
import { SCHEDULED_TIER_UPDATE_STATUSES } from '../tierUpdateState';

const mockScheduledTierUpdateFindMany = jest.fn();
const mockScheduledTierUpdateUpdateMany = jest.fn();
const mockScheduledTierUpdateUpsert = jest.fn();
const mockScheduledTierUpdateDeleteMany = jest.fn();
const mockUserFindUnique = jest.fn();
const mockClaimScheduledTierUpdate = jest.fn();
const mockRefreshScheduledTierUpdateHeartbeat = jest.fn();
const mockReleaseScheduledTierUpdateClaim = jest.fn();
const mockMarkScheduledTierUpdateFailed = jest.fn();
const mockSendTierSyncTransaction = jest.fn();

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
    QUICKNODE_HTTP_RPC_URL: '',
    TIER_RELAYER_PRIVATE_KEY: '',
    TIER_UPDATER_CONTRACT_ADDRESS: ''
}));

jest.mock('../walletBalanceMonitor', () => ({
    walletBalanceMonitor: {
        checkGasPriceSpike: jest.fn(),
        recordGasUsage: jest.fn()
    }
}));

jest.mock('../discordAlerts', () => ({
    alertContractUpdateFailed: jest.fn()
}));

jest.mock('../tierUpdateClaimService', () => ({
    claimScheduledTierUpdate: mockClaimScheduledTierUpdate,
    refreshScheduledTierUpdateHeartbeat: mockRefreshScheduledTierUpdateHeartbeat,
    releaseScheduledTierUpdateClaim: mockReleaseScheduledTierUpdateClaim,
    markScheduledTierUpdateFailed: mockMarkScheduledTierUpdateFailed
}));

jest.mock('../tierSync', () => {
    const actual = jest.requireActual('../tierSync');
    return {
        ...actual,
        sendTierSyncTransaction: mockSendTierSyncTransaction
    };
});

import {
    processScheduledTierUpdates,
    SCHEDULED_TIER_UPDATE_CLAIM_WORKER_ID
} from '../tierScheduler';

const backendRoot = path.resolve(__dirname, '../../../../');
const tierSchedulerPath = path.join(backendRoot, 'src/app/lib/tierScheduler.ts');

const fixedNow = new Date('2026-05-31T00:00:00.000Z');

const buildScheduledUpdate = (overrides: Record<string, unknown> = {}) => ({
    id: 42,
    userId: 7,
    scheduledAt: fixedNow,
    expectedTier: 31,
    currentTier: 0,
    processed: false,
    status: SCHEDULED_TIER_UPDATE_STATUSES.PENDING,
    user: {
        id: 7,
        wallet_address: '0x0000000000000000000000000000000000000007',
        holdingDate: 0,
        held_amount: 31,
        updatedAt: fixedNow
    },
    ...overrides
});

describe('tierScheduler claim service runtime adoption', () => {
    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(fixedNow);
        jest.clearAllMocks();
        mockScheduledTierUpdateFindMany.mockResolvedValue([]);
        mockScheduledTierUpdateUpdateMany.mockResolvedValue({ count: 1 });
        mockScheduledTierUpdateUpsert.mockResolvedValue({});
        mockScheduledTierUpdateDeleteMany.mockResolvedValue({ count: 0 });
        mockClaimScheduledTierUpdate.mockResolvedValue({ count: 1 });
        mockRefreshScheduledTierUpdateHeartbeat.mockResolvedValue({ count: 1 });
        mockReleaseScheduledTierUpdateClaim.mockResolvedValue({ count: 1 });
        mockMarkScheduledTierUpdateFailed.mockResolvedValue({ count: 1 });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('claims each PENDING candidate before existing processing and skips unclaimed rows', async () => {
        mockScheduledTierUpdateFindMany.mockResolvedValue([
            buildScheduledUpdate()
        ]);
        mockClaimScheduledTierUpdate.mockResolvedValueOnce({ count: 0 });

        await processScheduledTierUpdates();

        expect(mockClaimScheduledTierUpdate).toHaveBeenCalledWith(
            expect.objectContaining({
                scheduledTierUpdateId: 42,
                workerId: SCHEDULED_TIER_UPDATE_CLAIM_WORKER_ID,
                now: fixedNow,
                scheduledAtBefore: new Date('2026-05-31T01:00:00.000Z')
            })
        );
        expect(mockRefreshScheduledTierUpdateHeartbeat).not.toHaveBeenCalled();
        expect(mockScheduledTierUpdateUpdateMany).not.toHaveBeenCalled();
        expect(mockScheduledTierUpdateUpsert).not.toHaveBeenCalled();
        expect(mockSendTierSyncTransaction).not.toHaveBeenCalled();
    });

    it('continues the existing decision path only after a claim succeeds', async () => {
        mockScheduledTierUpdateFindMany.mockResolvedValue([
            buildScheduledUpdate()
        ]);

        await processScheduledTierUpdates();

        expect(mockClaimScheduledTierUpdate).toHaveBeenCalledTimes(1);
        expect(mockRefreshScheduledTierUpdateHeartbeat).toHaveBeenCalledTimes(2);
        expect(mockScheduledTierUpdateUpdateMany).toHaveBeenCalledWith({
            where: {
                id: 42,
                status: SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED,
                processed: false,
                lockedBy: SCHEDULED_TIER_UPDATE_CLAIM_WORKER_ID
            },
            data: expect.objectContaining({
                processed: true,
                lockedBy: null,
                lockedAt: null,
                heartbeatAt: null,
                lockExpiresAt: null,
                updatedAt: fixedNow
            })
        });
        expect(mockScheduledTierUpdateUpsert).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: 7 },
                update: expect.objectContaining({
                    processed: false,
                    status: SCHEDULED_TIER_UPDATE_STATUSES.PENDING,
                    attempt: 0,
                    lockedBy: null,
                    lockedAt: null,
                    heartbeatAt: null,
                    lockExpiresAt: null
                })
            })
        );
        expect(mockSendTierSyncTransaction).not.toHaveBeenCalled();
    });

    it('releases the claim when the tier boundary has not been crossed yet', async () => {
        mockScheduledTierUpdateFindMany.mockResolvedValue([
            buildScheduledUpdate({
                expectedTier: 31,
                user: {
                    id: 7,
                    wallet_address: '0x0000000000000000000000000000000000000007',
                    holdingDate: 0,
                    held_amount: 30,
                    updatedAt: fixedNow
                }
            })
        ]);

        await processScheduledTierUpdates();

        expect(mockClaimScheduledTierUpdate).toHaveBeenCalledTimes(1);
        expect(mockReleaseScheduledTierUpdateClaim).toHaveBeenCalledWith({
            prisma: expect.any(Object),
            scheduledTierUpdateId: 42,
            workerId: SCHEDULED_TIER_UPDATE_CLAIM_WORKER_ID
        });
        expect(mockScheduledTierUpdateUpdateMany).not.toHaveBeenCalled();
        expect(mockScheduledTierUpdateUpsert).not.toHaveBeenCalled();
        expect(mockSendTierSyncTransaction).not.toHaveBeenCalled();
    });

    it('keeps the PR-D2 PENDING-only query and avoids tx state or receipt polling wiring', () => {
        const source = fs.readFileSync(tierSchedulerPath, 'utf8');

        expect(source).toContain('where: buildScheduledTierUpdateProcessingWhere()');
        expect(source).toContain('claimScheduledTierUpdate');
        expect(source).toContain('refreshScheduledTierUpdateHeartbeat');
        expect(source).toContain('releaseScheduledTierUpdateClaim');
        expect(source).not.toContain('recordTierUpdateTxSent');
        expect(source).not.toContain('findPendingReceiptTierUpdates');
        expect(source).not.toContain('tierUpdateTxStateService');
    });
});
