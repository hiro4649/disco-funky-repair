/**
 * Monitoring Routes
 *
 * Provides endpoints for monitoring system health and resource usage
 */

import { Router, Request, Response } from 'express';
import { tokenBalanceService } from '../lib/quicknodeRpcService';
import { isSixHourUpdateRunning } from '../lib/trackingTokenBalanceEthereum';
import { getEventListenerStatus } from '../lib/realtimeEventListener';
import { checkingHoldingDateFromOnChain } from '../lib/optimizedHoldingDateChecker';
import { AuthAdmin } from '../config/passport';

const router = Router();

/**
 * GET /api/monitoring/realtime-status
 *
 * Returns WebSocket and QuickNode RPC status for daily batch fallback admin page.
 * When WebSocket or RPC is down, admin can run daily batch manually.
 */
router.get('/realtime-status', (req: Request, res: Response) => {
    try {
        const wsStatus = getEventListenerStatus();
        const health = tokenBalanceService.getHealthStatus();
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            websocket: wsStatus
                ? { connected: wsStatus.connected, reconnectAttempts: wsStatus.reconnectAttempts }
                : { connected: false, reconnectAttempts: 0, message: 'Listener not started' },
            quicknodeRpc: {
                available: health.quickNode.available,
                failureCount: health.quickNode.failureCount
            },
            realtimeHealthy: (wsStatus?.connected ?? false) && health.quickNode.available
        });
    } catch (error) {
        console.error('Error fetching realtime status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch realtime status'
        });
    }
});

/**
 * POST /api/monitoring/run-daily-batch
 *
 * Manually trigger the daily batch fallback (checkingHoldingDateFromOnChain).
 * Use when WebSocket or RPC is down to catch missed transactions.
 * Admin auth required.
 */
router.post('/run-daily-batch', AuthAdmin, async (req: Request, res: Response) => {
    try {
        const startTime = Date.now();
        await checkingHoldingDateFromOnChain();
        const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
        res.json({
            success: true,
            message: 'Daily batch fallback completed',
            durationSeconds: parseFloat(durationSeconds),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error running daily batch:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to run daily batch'
        });
    }
});

/**
 * GET /api/monitoring/quicknode-status
 *
 * Returns QuickNode RPC service health and credit usage
 * Useful for monitoring dashboard and alerts
 */
router.get('/quicknode-status', async (req: Request, res: Response) => {
    try {
        const status = tokenBalanceService.getHealthStatus();

        // Calculate days until credit reset (assuming monthly reset)
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - now.getDate();

        // Calculate projected usage
        const dailyUsage = status.quickNode.creditUsage.used / now.getDate();
        const projectedMonthlyUsage = dailyUsage * daysInMonth;
        const projectedPercentage = (projectedMonthlyUsage / status.quickNode.creditUsage.limit) * 100;

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            services: {
                quickNode: {
                    available: status.quickNode.available,
                    failureCount: status.quickNode.failureCount,
                    credits: {
                        used: status.quickNode.creditUsage.used,
                        usedMillions: +(status.quickNode.creditUsage.used / 1_000_000).toFixed(2),
                        limit: status.quickNode.creditUsage.limit,
                        limitMillions: 80,
                        percentage: +status.quickNode.creditUsage.percentage.toFixed(2),
                        remaining: status.quickNode.creditUsage.limit - status.quickNode.creditUsage.used,
                        remainingMillions: +((status.quickNode.creditUsage.limit - status.quickNode.creditUsage.used) / 1_000_000).toFixed(2)
                    },
                    projection: {
                        dailyUsage: +dailyUsage.toFixed(0),
                        dailyUsageMillions: +(dailyUsage / 1_000_000).toFixed(2),
                        projectedMonthlyUsage: +projectedMonthlyUsage.toFixed(0),
                        projectedMonthlyUsageMillions: +(projectedMonthlyUsage / 1_000_000).toFixed(2),
                        projectedPercentage: +projectedPercentage.toFixed(2),
                        daysRemaining,
                        willExceedLimit: projectedMonthlyUsage > status.quickNode.creditUsage.limit
                    },
                    warnings: generateWarnings(status.quickNode.creditUsage, projectedPercentage)
                },
                etherscan: {
                    available: status.etherscan.available,
                    role: 'fallback'
                }
            },
            backgroundJobs: {
                sixHourUpdate: {
                    status: isSixHourUpdateRunning(),
                    description: 'Runs every 6 hours at 00:00, 06:00, 12:00, 18:00 UTC'
                }
            }
        });
    } catch (error) {
        console.error('Error fetching QuickNode status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch service status'
        });
    }
});

/**
 * GET /api/monitoring/service-health
 *
 * Simple health check endpoint for uptime monitoring
 */
router.get('/service-health', (req: Request, res: Response) => {
    const status = tokenBalanceService.getHealthStatus();

    res.json({
        success: true,
        healthy: true,
        services: {
            quickNode: status.quickNode.available ? 'operational' : 'degraded',
            etherscan: 'operational'
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/monitoring/healthcheck
 *
 * External healthcheck endpoint for monitoring services (UptimeRobot, Pingdom, etc.)
 * Returns 200 OK if service is healthy, 503 if degraded
 * This endpoint should be called every 5 minutes by external monitoring
 */
router.get('/healthcheck', async (req: Request, res: Response) => {
    try {
        const status = tokenBalanceService.getHealthStatus();
        const isHealthy = status.quickNode.available || status.etherscan.available;

        if (isHealthy) {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                services: {
                    quickNode: status.quickNode.available ? 'operational' : 'fallback',
                    etherscan: 'operational'
                }
            });
        } else {
            res.status(503).json({
                status: 'degraded',
                timestamp: new Date().toISOString(),
                services: {
                    quickNode: 'unavailable',
                    etherscan: 'operational'
                },
                message: 'Service is in degraded state'
            });
        }
    } catch (error) {
        console.error('Healthcheck error:', error);
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Healthcheck failed'
        });
    }
});

/**
 * Helper function to generate warnings based on credit usage
 */
function generateWarnings(creditUsage: any, projectedPercentage: number): string[] {
    const warnings: string[] = [];

    // Current usage warnings
    if (creditUsage.percentage >= 90) {
        warnings.push('CRITICAL: Credits exceeded 90% of monthly limit');
    } else if (creditUsage.percentage >= 75) {
        warnings.push('WARNING: Credits exceeded 75% of monthly limit');
    } else if (creditUsage.percentage >= 50) {
        warnings.push('NOTICE: Credits exceeded 50% of monthly limit');
    }

    // Projected usage warnings
    if (projectedPercentage >= 100) {
        warnings.push('CRITICAL: Projected to exceed monthly credit limit');
    } else if (projectedPercentage >= 90) {
        warnings.push('WARNING: Projected to use 90%+ of monthly credits');
    }

    return warnings;
}

export default router;
