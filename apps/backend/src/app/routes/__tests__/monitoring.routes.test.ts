import express from 'express';
const request = require('supertest');

jest.mock('../../config/passport', () => ({
  AuthAdmin: (req: any, res: any, next: any) => {
    if (req.headers.authorization === 'Bearer admin-token') {
      req.user = { admin_id: 1, email: 'admin@example.com' };
      return next();
    }

    if (req.headers.authorization === 'Bearer user-token') {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }

    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }
}));

const mockGetHealthStatus = jest.fn();
const mockIsSixHourUpdateRunning = jest.fn();
const mockGetEventListenerStatus = jest.fn();
const mockCheckingHoldingDateFromOnChain = jest.fn();

jest.mock('../../lib/quicknodeRpcService', () => ({
  tokenBalanceService: {
    getHealthStatus: mockGetHealthStatus
  }
}));

jest.mock('../../lib/trackingTokenBalanceEthereum', () => ({
  isSixHourUpdateRunning: mockIsSixHourUpdateRunning
}));

jest.mock('../../lib/realtimeEventListener', () => ({
  getEventListenerStatus: mockGetEventListenerStatus
}));

jest.mock('../../lib/optimizedHoldingDateChecker', () => ({
  checkingHoldingDateFromOnChain: mockCheckingHoldingDateFromOnChain
}));

import monitoringRoutes from '../monitoring.routes';

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(monitoringRoutes);
  return app;
};

const healthyStatus = () => ({
  quickNode: {
    available: true,
    failureCount: 0,
    creditUsage: {
      used: 1000,
      limit: 80_000_000,
      percentage: 0.00125
    }
  },
  etherscan: {
    available: true
  }
});

describe('monitoring routes authorization and public health surface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHealthStatus.mockReturnValue(healthyStatus());
    mockIsSixHourUpdateRunning.mockReturnValue(false);
    mockGetEventListenerStatus.mockReturnValue({ connected: true, reconnectAttempts: 0 });
    mockCheckingHoldingDateFromOnChain.mockResolvedValue(undefined);
  });

  it.each([
    '/realtime-status',
    '/quicknode-status',
    '/service-health'
  ])('requires admin authentication for detailed monitoring route %s', async (path) => {
    const unauthenticated = await request(createApp()).get(path);
    const userAuthenticated = await request(createApp())
      .get(path)
      .set('Authorization', 'Bearer user-token');

    expect(unauthenticated.status).toBe(401);
    expect(userAuthenticated.status).toBe(403);
    expect(mockGetHealthStatus).not.toHaveBeenCalled();
    expect(mockGetEventListenerStatus).not.toHaveBeenCalled();
  });

  it.each([
    '/realtime-status',
    '/quicknode-status',
    '/service-health'
  ])('allows admin authentication to reach detailed monitoring route %s', async (path) => {
    const response = await request(createApp())
      .get(path)
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('timestamp');
  });

  it('keeps manual daily batch route behind admin authentication', async () => {
    const unauthenticated = await request(createApp()).post('/run-daily-batch');
    const userAuthenticated = await request(createApp())
      .post('/run-daily-batch')
      .set('Authorization', 'Bearer user-token');
    const adminAuthenticated = await request(createApp())
      .post('/run-daily-batch')
      .set('Authorization', 'Bearer admin-token');

    expect(unauthenticated.status).toBe(401);
    expect(userAuthenticated.status).toBe(403);
    expect(adminAuthenticated.status).toBe(200);
    expect(mockCheckingHoldingDateFromOnChain).toHaveBeenCalledTimes(1);
  });

  it('keeps public healthcheck limited to non-operational fields', async () => {
    const response = await request(createApp()).get('/healthcheck');

    expect(response.status).toBe(200);
    expect(Object.keys(response.body).sort()).toEqual(['healthy', 'status', 'timestamp']);
    expect(response.body).toMatchObject({
      status: 'healthy',
      healthy: true
    });
    expect(response.body).not.toHaveProperty('services');
    expect(response.body).not.toHaveProperty('quickNode');
    expect(response.body).not.toHaveProperty('failureCount');
    expect(response.body).not.toHaveProperty('creditUsage');
    expect(response.body).not.toHaveProperty('quicknodeRpc');
    expect(response.body).not.toHaveProperty('etherscan');
    expect(response.body).not.toHaveProperty('credits');
    expect(response.body).not.toHaveProperty('projection');
    expect(response.body).not.toHaveProperty('warnings');
    expect(response.body).not.toHaveProperty('reconnectAttempts');
  });
});
