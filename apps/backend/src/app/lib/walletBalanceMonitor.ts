/**
 * Wallet Balance Monitor
 *
 * Monitors admin wallet balance and predicts when gas fees will be insufficient.
 * Sends proactive alerts to Discord before running out of funds.
 *
 * Monitoring Strategy:
 * 1. Check balance before each contract update
 * 2. Track daily gas usage patterns
 * 3. Predict days remaining based on usage trends
 * 4. Alert when balance drops below thresholds
 */

import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import {
    alertBalanceCritical,
    alertBalanceWarning,
    alertBalanceInfo,
    alertGasPriceSpike
} from './discordAlerts';
import { safeLogError, safeLogWarn } from '../utils/safeLogger';
import { withRpcReadTimeout } from '../utils/externalCallTimeout';

const prisma = new PrismaClient();

const QUICKNODE_HTTP_RPC_URL = process.env.QUICKNODE_HTTP_RPC_URL || '';
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || '';

// Balance thresholds (in BNB) - Standardized 3-tier system
const CRITICAL_BALANCE_THRESHOLD = ethers.parseEther('0.01'); // < 0.01 BNB = CRITICAL
const WARNING_BALANCE_THRESHOLD = ethers.parseEther('0.05');  // < 0.05 BNB = WARNING
const INFO_BALANCE_THRESHOLD = ethers.parseEther('0.1');      // < 0.1 BNB = INFO

// Gas price spike threshold (percentage increase)
const GAS_PRICE_SPIKE_THRESHOLD = 50; // 50% increase = spike

/**
 * Gas usage tracking (stored in memory, could be moved to database)
 */
interface GasUsageRecord {
    timestamp: number;
    gasUsed: bigint;
    gasCost: bigint;
    transactionType: 'tier_update' | 'batch_update';
}

class WalletBalanceMonitor {
    private gasUsageHistory: GasUsageRecord[] = [];
    private lastBalanceCheck: bigint | null = null;
    private lastGasPrice: bigint | null = null;
    private lastAlertTime: { [key: string]: number } = {};
    private currentBalanceState: 'healthy' | 'info' | 'warning' | 'critical' = 'healthy';

    // Alert cooldown periods (state-based, per state)
    private readonly ALERT_COOLDOWN_MS = {
        critical: 30 * 60 * 1000,  // 30 minutes
        warning: 60 * 60 * 1000,    // 1 hour
        info: 3 * 60 * 60 * 1000,  // 3 hours
        gasSpike: 60 * 60 * 1000   // 1 hour
    };

    /**
     * Get admin wallet address and balance
     */
    async getAdminWalletInfo(): Promise<{ address: string; balance: bigint } | null> {
        if (!ADMIN_PRIVATE_KEY || !QUICKNODE_HTTP_RPC_URL) {
            safeLogWarn('wallet_balance_monitor_config_missing', new Error('Wallet monitor configuration missing'), {
                hasAdminCredential: Boolean(ADMIN_PRIVATE_KEY),
                hasRpcEndpoint: Boolean(QUICKNODE_HTTP_RPC_URL)
            });
            return null;
        }

        try {
            const provider = new ethers.JsonRpcProvider(QUICKNODE_HTTP_RPC_URL);
            const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
            const balance = await withRpcReadTimeout<bigint>(
                provider.getBalance(wallet.address),
                'wallet_monitor_native_balance'
            );

            return {
                address: wallet.address,
                balance
            };
        } catch (error) {
            safeLogError('wallet_balance_get_admin_info', error);
            return null;
        }
    }

    /**
     * Check if balance is sufficient for a transaction
     * Returns: { sufficient: boolean, balance: bigint, estimatedCost: bigint }
     */
    async checkBalanceBeforeTransaction(estimatedGas: bigint, gasPrice: bigint): Promise<{
        sufficient: boolean;
        balance: bigint;
        estimatedCost: bigint;
        remainingTransactions: number;
    } | null> {
        const walletInfo = await this.getAdminWalletInfo();
        if (!walletInfo) return null;

        const estimatedCost = estimatedGas * gasPrice;
        const sufficient = walletInfo.balance >= estimatedCost;

        // Calculate how many more transactions we can afford
        const remainingTransactions = sufficient
            ? Number(walletInfo.balance / estimatedCost)
            : 0;

        // Determine current state based on balance
        let newState: 'healthy' | 'info' | 'warning' | 'critical';
        if (!sufficient || walletInfo.balance < CRITICAL_BALANCE_THRESHOLD) {
            newState = 'critical';
        } else if (walletInfo.balance < WARNING_BALANCE_THRESHOLD) {
            newState = 'warning';
        } else if (walletInfo.balance < INFO_BALANCE_THRESHOLD) {
            newState = 'info';
        } else {
            newState = 'healthy';
        }

        // State-based alerting: only alert on state transition or if already in that state (with cooldown)
        const isStateTransition = newState !== this.currentBalanceState;
        let shouldAlert = false;
        
        if (newState !== 'healthy') {
            // For non-healthy states, check if we should alert (transition or cooldown expired)
            shouldAlert = isStateTransition || this.shouldSendAlert(newState as 'critical' | 'warning' | 'info');
        }
        
        if (shouldAlert) {
            if (newState === 'critical') {
                await this.sendBalanceCriticalAlert(walletInfo.address, walletInfo.balance, estimatedCost, remainingTransactions);
            } else if (newState === 'warning') {
                await this.sendBalanceWarningAlert(walletInfo.address, walletInfo.balance);
            } else if (newState === 'info') {
                await this.sendBalanceInfoAlert(walletInfo.address, walletInfo.balance);
            }
        }
        
        // Always update state, even if we didn't send an alert
        this.currentBalanceState = newState;

        this.lastBalanceCheck = walletInfo.balance;

        return {
            sufficient,
            balance: walletInfo.balance,
            estimatedCost,
            remainingTransactions
        };
    }

    /**
     * Record gas usage for a transaction
     */
    recordGasUsage(gasUsed: bigint, gasCost: bigint, transactionType: 'tier_update' | 'batch_update' = 'tier_update'): void {
        this.gasUsageHistory.push({
            timestamp: Date.now(),
            gasUsed,
            gasCost,
            transactionType
        });

        // Keep only last 7 days of history
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        this.gasUsageHistory = this.gasUsageHistory.filter(record => record.timestamp > sevenDaysAgo);
    }

    /**
     * Calculate average daily gas usage
     */
    calculateDailyGasUsage(): bigint {
        if (this.gasUsageHistory.length === 0) {
            // Default estimate: 10 transactions per day, 100k gas each, 5 gwei
            // 10 * 100,000 * 5 gwei = 0.005 BNB/day
            return ethers.parseEther('0.005');
        }

        // Calculate total gas cost in history
        const totalGasCost = this.gasUsageHistory.reduce(
            (sum, record) => sum + record.gasCost,
            BigInt(0)
        );

        // Calculate days in history
        const oldestTimestamp = Math.min(...this.gasUsageHistory.map(r => r.timestamp));
        const daysInHistory = Math.max((Date.now() - oldestTimestamp) / (24 * 60 * 60 * 1000), 1);

        // Average daily usage
        const dailyUsage = totalGasCost / BigInt(Math.floor(daysInHistory));

        return dailyUsage;
    }

    /**
     * Predict days remaining until balance runs out
     */
    async predictDaysRemaining(): Promise<number | null> {
        const walletInfo = await this.getAdminWalletInfo();
        if (!walletInfo) return null;

        const dailyUsage = this.calculateDailyGasUsage();
        if (dailyUsage === BigInt(0)) return null;

        const daysRemaining = Number(walletInfo.balance / dailyUsage);
        return Math.floor(daysRemaining);
    }

    /**
     * Check for gas price spikes
     */
    async checkGasPriceSpike(currentGasPrice: bigint): Promise<void> {
        if (!this.lastGasPrice) {
            this.lastGasPrice = currentGasPrice;
            return;
        }

        // Calculate percentage increase
        const increase = Number(currentGasPrice - this.lastGasPrice);
        const percentageIncrease = (increase / Number(this.lastGasPrice)) * 100;

        if (percentageIncrease >= GAS_PRICE_SPIKE_THRESHOLD) {
            if (this.shouldSendAlert('gasSpike')) {
                await alertGasPriceSpike(currentGasPrice, this.lastGasPrice, percentageIncrease);
                this.lastAlertTime['gasSpike'] = Date.now();
            }
        }

        this.lastGasPrice = currentGasPrice;
    }

    /**
     * Send balance critical alert (CRITICAL)
     */
    private async sendBalanceCriticalAlert(
        walletAddress: string,
        balance: bigint,
        estimatedCost: bigint,
        remainingTransactions: number
    ): Promise<void> {
        await alertBalanceCritical(walletAddress, balance, estimatedCost, remainingTransactions);
        this.lastAlertTime['critical'] = Date.now();
    }

    /**
     * Send balance warning alert (WARNING)
     */
    private async sendBalanceWarningAlert(walletAddress: string, balance: bigint): Promise<void> {
        const daysRemaining = await this.predictDaysRemaining();
        if (daysRemaining === null) return;

        const dailyUsage = this.calculateDailyGasUsage();
        await alertBalanceWarning(walletAddress, balance, dailyUsage, daysRemaining);
        this.lastAlertTime['warning'] = Date.now();
    }

    /**
     * Send balance info alert (INFO)
     */
    private async sendBalanceInfoAlert(walletAddress: string, balance: bigint): Promise<void> {
        const daysRemaining = await this.predictDaysRemaining();
        if (daysRemaining === null) return;

        const dailyUsage = this.calculateDailyGasUsage();
        await alertBalanceInfo(walletAddress, balance, dailyUsage, daysRemaining);
        this.lastAlertTime['info'] = Date.now();
    }

    /**
     * Check if we should send an alert (respects cooldown periods)
     */
    private shouldSendAlert(state: 'critical' | 'warning' | 'info' | 'gasSpike'): boolean {
        const alertType = state === 'gasSpike' ? 'gasSpike' : state;
        const lastAlert = this.lastAlertTime[alertType] || 0;
        const cooldown = this.ALERT_COOLDOWN_MS[alertType];
        return (Date.now() - lastAlert) >= cooldown;
    }

    /**
     * Get current wallet status (for health checks)
     */
    async getWalletStatus(): Promise<{
        address: string;
        balance: string;
        balanceInBNB: string;
        dailyUsage: string;
        dailyUsageInBNB: string;
        daysRemaining: number | null;
        status: 'critical' | 'warning' | 'info' | 'healthy';
    } | null> {
        const walletInfo = await this.getAdminWalletInfo();
        if (!walletInfo) return null;

        const dailyUsage = this.calculateDailyGasUsage();
        const daysRemaining = await this.predictDaysRemaining();

        let status: 'critical' | 'warning' | 'info' | 'healthy' = 'healthy';
        if (walletInfo.balance < CRITICAL_BALANCE_THRESHOLD) {
            status = 'critical';
        } else if (walletInfo.balance < WARNING_BALANCE_THRESHOLD) {
            status = 'warning';
        } else if (walletInfo.balance < INFO_BALANCE_THRESHOLD) {
            status = 'info';
        }

        return {
            address: walletInfo.address,
            balance: walletInfo.balance.toString(),
            balanceInBNB: ethers.formatEther(walletInfo.balance),
            dailyUsage: dailyUsage.toString(),
            dailyUsageInBNB: ethers.formatEther(dailyUsage),
            daysRemaining,
            status
        };
    }

    /**
     * Perform daily balance check (scheduled task)
     */
    async performDailyBalanceCheck(): Promise<void> {
        const status = await this.getWalletStatus();
        if (!status) {
            safeLogWarn('wallet_balance_daily_check_status_missing', new Error('Wallet status unavailable'));
            return;
        }

        // Send alert based on status (state-based)
        if (status.status === 'critical') {
            await this.sendBalanceCriticalAlert(
                status.address,
                BigInt(status.balance),
                ethers.parseEther('0.001'), // Dummy cost for alert
                0
            );
        } else if (status.status === 'warning') {
            if (status.daysRemaining !== null) {
                await this.sendBalanceWarningAlert(status.address, BigInt(status.balance));
            }
        } else if (status.status === 'info') {
            if (status.daysRemaining !== null) {
                await this.sendBalanceInfoAlert(status.address, BigInt(status.balance));
            }
        }
    }
}

// Export singleton instance
export const walletBalanceMonitor = new WalletBalanceMonitor();

export default walletBalanceMonitor;
