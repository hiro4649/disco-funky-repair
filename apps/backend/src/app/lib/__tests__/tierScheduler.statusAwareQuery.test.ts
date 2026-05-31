import fs from 'fs';
import path from 'path';
import type { Prisma, ScheduledTierUpdateStatus } from '@prisma/client';
import { SCHEDULED_TIER_UPDATE_STATUSES } from '../tierUpdateState';

const mockFindMany = jest.fn();

jest.mock('../../db/prisma_client', () => ({
    __esModule: true,
    default: {
        scheduledTierUpdate: {
            findMany: mockFindMany
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

const backendRoot = path.resolve(__dirname, '../../../../');
const tierSchedulerPath = path.join(backendRoot, 'src/app/lib/tierScheduler.ts');

let buildScheduledTierUpdateProcessingWhere: (
    now?: Date
) => Prisma.ScheduledTierUpdateWhereInput;
let SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES: ScheduledTierUpdateStatus[];

describe('tierScheduler status-aware processing query', () => {
    beforeAll(() => {
        const scheduler = require('../tierScheduler');
        buildScheduledTierUpdateProcessingWhere = scheduler.buildScheduledTierUpdateProcessingWhere;
        SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES =
            scheduler.SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES;
    });

    it('builds a bounded query for unprocessed pending updates due within the next hour', () => {
        const now = new Date('2026-05-28T00:00:00.000Z');

        expect(buildScheduledTierUpdateProcessingWhere(now)).toEqual({
            scheduledAt: {
                lte: new Date('2026-05-28T01:00:00.000Z')
            },
            processed: false,
            status: {
                in: [SCHEDULED_TIER_UPDATE_STATUSES.PENDING]
            }
        });
    });

    it('does not include claimed, sent, confirmed, manual review, canceled, or retry statuses yet', () => {
        expect(SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES).toEqual([
            SCHEDULED_TIER_UPDATE_STATUSES.PENDING
        ]);

        expect(SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES).not.toContain(
            SCHEDULED_TIER_UPDATE_STATUSES.CLAIMED
        );
        expect(SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES).not.toContain(
            SCHEDULED_TIER_UPDATE_STATUSES.TX_SENT
        );
        expect(SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES).not.toContain(
            SCHEDULED_TIER_UPDATE_STATUSES.CONFIRMED
        );
        expect(SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES).not.toContain(
            SCHEDULED_TIER_UPDATE_STATUSES.FAILED
        );
        expect(SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES).not.toContain(
            SCHEDULED_TIER_UPDATE_STATUSES.TIMED_OUT
        );
        expect(SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES).not.toContain(
            SCHEDULED_TIER_UPDATE_STATUSES.MANUAL_REVIEW
        );
        expect(SCHEDULED_TIER_UPDATE_PROCESSING_STATUSES).not.toContain(
            SCHEDULED_TIER_UPDATE_STATUSES.CANCELED
        );
    });

    it('keeps processScheduledTierUpdates on the status-aware helper with claim-only runtime adoption', () => {
        const source = fs.readFileSync(tierSchedulerPath, 'utf8');

        expect(source).toContain('where: buildScheduledTierUpdateProcessingWhere()');
        expect(source).toContain('tierUpdateClaimService');
        expect(source).toContain('claimScheduledTierUpdate');
        expect(source).not.toContain('tierUpdateTxStateService');
        expect(source).not.toContain('recordTierUpdateTxSent');
        expect(source).not.toContain('findPendingReceiptTierUpdates');
    });

    it('does not query the database while importing the status-aware helper', () => {
        expect(mockFindMany).not.toHaveBeenCalled();
    });
});
