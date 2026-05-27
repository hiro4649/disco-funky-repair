type MockScheduledTask = {
    start: jest.Mock;
    stop: jest.Mock;
    now: jest.Mock;
    destroy: jest.Mock;
};

let mockCreatedTasks: MockScheduledTask[] = [];

const mockSchedule = jest.fn(() => {
    const task = {
        start: jest.fn(),
        stop: jest.fn(),
        now: jest.fn(),
        destroy: jest.fn()
    };
    mockCreatedTasks.push(task);
    return task;
});

export {};

const mockStartRealtimeEventListener = jest.fn();
const mockStopRealtimeEventListener = jest.fn().mockResolvedValue(undefined);

const mockPrisma = {
    user: {
        count: jest.fn()
    },
    ticketCode: {
        updateMany: jest.fn()
    }
};

jest.mock('node-cron', () => ({
    __esModule: true,
    default: {
        schedule: mockSchedule
    },
    schedule: mockSchedule
}));

jest.mock('../routes/routes', () => {
    const express = require('express');
    return {
        Router: express.Router()
    };
});

jest.mock('../db/prisma_client', () => ({
    __esModule: true,
    default: mockPrisma
}));

jest.mock('../lib/trackingTokenBalanceEthereum', () => ({
    processSixHourTokenBalance: jest.fn(),
    processWeeklyBonus: jest.fn()
}));

jest.mock('../lib/trackingTokensEthereum', () => ({
    setProbability: jest.fn(),
    registerAllEthereumTokens: jest.fn()
}));

jest.mock('../lib/holdingDateService', () => ({
    updateHoldingDateMilestones: jest.fn()
}));

jest.mock('../lib/optimizedHoldingDateChecker', () => ({
    checkingHoldingDateFromOnChain: jest.fn()
}));

jest.mock('../lib/realtimeEventListener', () => ({
    startRealtimeEventListener: mockStartRealtimeEventListener,
    stopRealtimeEventListener: mockStopRealtimeEventListener
}));

jest.mock('../lib/tierScheduler', () => ({
    processScheduledTierUpdates: jest.fn(),
    cleanupOldScheduledUpdates: jest.fn()
}));

jest.mock('../lib/hourlyHoldingDurationUpdater', () => ({
    updateAllUsersHoldingDuration: jest.fn()
}));

jest.mock('../lib/walletBalanceMonitor', () => ({
    walletBalanceMonitor: {
        performDailyBalanceCheck: jest.fn()
    }
}));

jest.mock('../utils/safeLogger', () => ({
    safeLogError: jest.fn(),
    safeLogWarn: jest.fn(),
    sanitizeLogText: jest.fn((value: string) => value)
}));

describe('tracking service startup boundary', () => {
    const originalSessionSecret = process.env.SESSION_SECRET;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        mockCreatedTasks = [];
        process.env.SESSION_SECRET = 'codex-test-session-secret';
    });

    afterEach(() => {
        if (originalSessionSecret === undefined) {
            delete process.env.SESSION_SECRET;
        } else {
            process.env.SESSION_SECRET = originalSessionSecret;
        }
    });

    it('does not start tracking schedulers when the HTTP app is imported', async () => {
        await import('../index');

        expect(mockSchedule).not.toHaveBeenCalled();
        expect(mockStartRealtimeEventListener).not.toHaveBeenCalled();
    });

    it('keeps trackingService import safe until explicit startup', async () => {
        await import('../services/trackingService');

        expect(mockSchedule).not.toHaveBeenCalled();
        expect(mockStartRealtimeEventListener).not.toHaveBeenCalled();
    });

    it('starts tracking cron tasks and realtime listener once', async () => {
        const { startTrackingSchedulers, stopTrackingSchedulers } =
            await import('../services/trackingService');

        startTrackingSchedulers();

        expect(mockSchedule).toHaveBeenCalledTimes(9);
        expect(mockStartRealtimeEventListener).toHaveBeenCalledTimes(1);

        startTrackingSchedulers();

        expect(mockSchedule).toHaveBeenCalledTimes(9);
        expect(mockStartRealtimeEventListener).toHaveBeenCalledTimes(1);

        await stopTrackingSchedulers();
    });

    it('stops registered tracking cron tasks and realtime listener', async () => {
        const { startTrackingSchedulers, stopTrackingSchedulers } =
            await import('../services/trackingService');

        startTrackingSchedulers();
        const registeredTasks = [...mockCreatedTasks];

        await stopTrackingSchedulers();

        for (const task of registeredTasks) {
            expect(task.stop).toHaveBeenCalledTimes(1);
            expect(task.destroy).toHaveBeenCalledTimes(1);
        }
        expect(mockStopRealtimeEventListener).toHaveBeenCalledTimes(1);
    });
});
