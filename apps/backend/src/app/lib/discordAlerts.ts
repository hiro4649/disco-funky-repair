/**
 * Discord Alert System (Improved)
 *
 * Sends critical alerts to Discord server for admin monitoring with:
 * - Standardized alert levels (CRITICAL/WARNING/INFO)
 * - Contract failure aggregation (prevents spam)
 * - Enhanced diagnostic information
 * - Common metadata (env, chain, service, correlationId)
 * - QuickNode fallback transparency
 */

import { ethers } from 'ethers';
import { DISCORD_WEBHOOK_URL, NODE_ENV, CHAIN_NAME, SERVICE_VERSION } from '../config/env';
import { safeLogError, safeLogWarn, sanitizeLogText } from '../utils/safeLogger';
import { fetchWithTimeout } from '../utils/externalCallTimeout';

/**
 * Generate correlation ID for log tracking
 */
function generateCorrelationId(): string {
    return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get common metadata for all alerts
 */
function getCommonMetadata(service: string = 'unknown'): Array<{ name: string; value: string; inline?: boolean }> {
    const correlationId = generateCorrelationId();
    return [
        { name: 'Environment', value: `\`${NODE_ENV}\``, inline: true },
        { name: 'Chain', value: `\`${CHAIN_NAME}\``, inline: true },
        { name: 'Service', value: `\`${service}\``, inline: true },
        { name: 'Correlation ID', value: `\`${correlationId}\``, inline: false },
        { name: 'Version', value: `\`${SERVICE_VERSION}\``, inline: true }
    ];
}

interface DiscordAlert {
    title: string;
    description: string;
    color: number; // Discord embed color (decimal)
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    timestamp?: string;
}

/**
 * Discord color codes
 */
export const AlertColor = {
    CRITICAL: 0xFF0000,  // Red
    WARNING: 0xFFA500,   // Orange
    INFO: 0x00FF00,      // Green
    ERROR: 0xFF0000      // Red
};

/**
 * Send alert to Discord webhook with common metadata
 */
export async function sendDiscordAlert(
    alert: DiscordAlert,
    service: string = 'system'
): Promise<void> {
    if (!DISCORD_WEBHOOK_URL) {
        safeLogWarn('discord_alert_webhook_missing', new Error('Discord webhook is not configured'), {
            service,
            hasFields: Boolean(alert.fields?.length),
            color: alert.color
        });
        return;
    }

    try {
        // Add common metadata to fields
        const commonMetadata = getCommonMetadata(service);
        const allFields = [...(alert.fields || []), ...commonMetadata];

        const embed = {
            embeds: [{
                title: `${alert.title}`,
                description: alert.description,
                color: alert.color,
                fields: allFields,
                timestamp: alert.timestamp || new Date().toISOString(),
                footer: {
                    text: 'FUNKY RAVE Gacha Game Alert System'
                }
            }]
        };

        const response = await fetchWithTimeout(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(embed)
        }, undefined, 'discord_webhook_send');

        if (!response.ok) {
            throw new Error('Discord webhook request failed');
        }

    } catch (error) {
        safeLogError('discord_alert_send', error, {
            service,
            hasFields: Boolean(alert.fields?.length),
            color: alert.color
        });
    }
}

/**
 * Alert: Admin wallet balance - CRITICAL (< 0.01 BNB)
 * State-based: Only sends when transitioning to CRITICAL or already in CRITICAL
 */
export async function alertBalanceCritical(
    walletAddress: string,
    currentBalance: bigint,
    estimatedCost: bigint,
    remainingTransactions: number
): Promise<void> {
    const balanceInBNB = ethers.formatEther(currentBalance);
    const costInBNB = ethers.formatEther(estimatedCost);

    await sendDiscordAlert({
        title: '💰 管理ウォレット残高: CRITICAL',
        description: '⚠️  コントラクト更新に必要な残高が不足しています！',
        color: AlertColor.CRITICAL,
        fields: [
            { name: 'ウォレットアドレス', value: `\`${walletAddress}\``, inline: false },
            { name: '現在の残高', value: `**${balanceInBNB} BNB**`, inline: true },
            { name: '必要な金額', value: `${costInBNB} BNB`, inline: true },
            { name: '残り実行可能回数', value: `約${remainingTransactions}回`, inline: true },
            { name: '⚠️  必要な対応', value: '**すぐに管理ウォレットへBNBを入金してください！**\n最低入金額: **0.5 BNB**\n送金後復旧見込み: **5分以内**', inline: false }
        ]
    }, 'walletBalanceMonitor');
}

/**
 * Alert: Admin wallet balance - WARNING (< 0.05 BNB)
 * State-based: Only sends when transitioning to WARNING or already in WARNING
 */
export async function alertBalanceWarning(
    walletAddress: string,
    currentBalance: bigint,
    estimatedDailyUsage: bigint,
    daysRemaining: number
): Promise<void> {
    const balanceInBNB = ethers.formatEther(currentBalance);
    const dailyUsageInBNB = ethers.formatEther(estimatedDailyUsage);

    await sendDiscordAlert({
        title: '⚠️  管理ウォレット残高: WARNING',
        description: `現在の使用量で計算すると、管理ウォレットの残高が約**${daysRemaining}日後**に不足します。`,
        color: AlertColor.WARNING,
        fields: [
            { name: 'ウォレットアドレス', value: `\`${walletAddress}\``, inline: false },
            { name: '現在の残高', value: `**${balanceInBNB} BNB**`, inline: true },
            { name: '1日あたりのガス消費量', value: `約${dailyUsageInBNB} BNB`, inline: true },
            { name: '残り日数', value: `**約${daysRemaining}日**`, inline: true },
            { name: '📋 推奨事項', value: 'サービス中断を避けるため、早めに管理ウォレットへBNBを入金してください。\n推奨入金額: **0.3-0.5 BNB**', inline: false }
        ]
    }, 'walletBalanceMonitor');
}

/**
 * Alert: Admin wallet balance - INFO (< 0.1 BNB)
 * State-based: Only sends when transitioning to INFO or already in INFO
 */
export async function alertBalanceInfo(
    walletAddress: string,
    currentBalance: bigint,
    estimatedDailyUsage: bigint,
    daysRemaining: number
): Promise<void> {
    const balanceInBNB = ethers.formatEther(currentBalance);
    const dailyUsageInBNB = ethers.formatEther(estimatedDailyUsage);

    await sendDiscordAlert({
        title: 'ℹ️  管理ウォレット残高: INFO',
        description: `管理ウォレットの残高が減少しています。監視を継続します。`,
        color: AlertColor.INFO,
        fields: [
            { name: 'ウォレットアドレス', value: `\`${walletAddress}\``, inline: false },
            { name: '現在の残高', value: `**${balanceInBNB} BNB**`, inline: true },
            { name: '1日あたりのガス消費量', value: `約${dailyUsageInBNB} BNB`, inline: true },
            { name: '残り日数', value: `**約${daysRemaining}日**`, inline: true },
            { name: '📋 備考', value: '現在は正常範囲内です。継続監視中。', inline: false }
        ]
    }, 'walletBalanceMonitor');
}

/**
 * Contract failure aggregation system
 * Aggregates failures by error type over a time window to prevent spam
 */
interface FailureRecord {
    userId: number;
    walletAddress: string;
    error: Error;
    timestamp: number;
}

class FailureAggregator {
    private failures: Map<string, FailureRecord[]> = new Map(); // Key: error type, Value: failures
    private lastAggregationTime: number = 0;
    private readonly AGGREGATION_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
    private readonly USER_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour per user
    private userLastAlert: Map<number, number> = new Map();

    /**
     * Record a failure
     */
    recordFailure(userId: number, walletAddress: string, error: Error): void {
        const errorType = this.getErrorType(error);
        const key = errorType;

        if (!this.failures.has(key)) {
            this.failures.set(key, []);
        }

        this.failures.get(key)!.push({
            userId,
            walletAddress,
            error,
            timestamp: Date.now()
        });

        // Check if we should send aggregated alert
        this.checkAndSendAggregated();
    }

    /**
     * Get error type for grouping
     */
    private getErrorType(error: Error): string {
        const msg = error.message.toLowerCase();
        if (msg.includes('insufficient funds') || msg.includes('insufficient balance')) {
            return 'insufficient_funds';
        }
        if (msg.includes('nonce') || msg.includes('replacement transaction underpriced')) {
            return 'nonce_error';
        }
        if (msg.includes('rate limit') || msg.includes('too many requests')) {
            return 'rate_limit';
        }
        if (msg.includes('gas') || msg.includes('gas price')) {
            return 'gas_error';
        }
        if (msg.includes('network') || msg.includes('timeout') || msg.includes('connection')) {
            return 'network_error';
        }
        if (msg.includes('rpc') || msg.includes('provider')) {
            return 'rpc_error';
        }
        return 'unknown_error';
    }

    /**
     * Check if we should send aggregated alert
     */
    private async checkAndSendAggregated(): Promise<void> {
        const now = Date.now();

        // Send aggregated alerts every 5 minutes
        if (now - this.lastAggregationTime < this.AGGREGATION_WINDOW_MS) {
            return;
        }

        this.lastAggregationTime = now;

        // Process each error type
        for (const [errorType, failures] of this.failures.entries()) {
            if (failures.length === 0) continue;

            // Filter failures within window
            const recentFailures = failures.filter(
                f => now - f.timestamp < this.AGGREGATION_WINDOW_MS
            );

            if (recentFailures.length === 0) continue;

            // Send aggregated alert
            await this.sendAggregatedAlert(errorType, recentFailures);

            // Remove processed failures
            this.failures.set(errorType, failures.filter(
                f => now - f.timestamp >= this.AGGREGATION_WINDOW_MS
            ));
        }
    }

    /**
     * Send aggregated alert for an error type
     */
    private async sendAggregatedAlert(
        errorType: string,
        failures: FailureRecord[]
    ): Promise<void> {
        const errorTypeNames: Record<string, string> = {
            'insufficient_funds': '残高不足',
            'nonce_error': 'Nonceエラー',
            'rate_limit': 'レート制限',
            'gas_error': 'ガスエラー',
            'network_error': 'ネットワークエラー',
            'rpc_error': 'RPCエラー',
            'unknown_error': '不明なエラー'
        };

        const errorTypeName = errorTypeNames[errorType] || errorType;
        const uniqueUsers = new Set(failures.map(f => f.userId));
        const sampleErrorMessage = sanitizeLogText(failures[0].error.message);

        // Get sample user IDs (max 5)
        const sampleUserIds = Array.from(uniqueUsers).slice(0, 5);
        const moreUsers = uniqueUsers.size > 5 ? `他${uniqueUsers.size - 5}ユーザー` : '';

        await sendDiscordAlert({
            title: `❌ コントラクト更新失敗 (集約)`,
            description: `**${failures.length}件**の失敗が**${errorTypeName}**で発生しました。`,
            color: AlertColor.ERROR,
            fields: [
                { name: 'エラータイプ', value: `\`${errorTypeName}\``, inline: true },
                { name: '失敗件数', value: `**${failures.length}件**`, inline: true },
                { name: '影響ユーザー数', value: `**${uniqueUsers.size}ユーザー**`, inline: true },
                { name: 'サンプルユーザーID', value: `${sampleUserIds.join(', ')}${moreUsers ? ` (${moreUsers})` : ''}`, inline: false },
                { name: 'エラーメッセージ例', value: `\`\`\`${sampleErrorMessage.slice(0, 300)}\`\`\``, inline: false },
                { name: '📋 詳細情報', value: '詳細なログとユーザーID一覧はログファイルまたはDBを確認してください。\n次回の毎時スケジュール更新で自動的に再試行されます。', inline: false }
            ]
        }, 'tierScheduler');
    }

    /**
     * Check if we should alert for a specific user (1 hour cooldown per user)
     */
    shouldAlertForUser(userId: number): boolean {
        const lastAlert = this.userLastAlert.get(userId) || 0;
        return (Date.now() - lastAlert) >= this.USER_COOLDOWN_MS;
    }

    /**
     * Mark user as alerted
     */
    markUserAlerted(userId: number): void {
        this.userLastAlert.set(userId, Date.now());
    }
}

// Singleton instance
const failureAggregator = new FailureAggregator();

/**
 * Alert: Contract update failed (uses aggregation)
 */
export async function alertContractUpdateFailed(
    userId: number,
    walletAddress: string,
    error: Error,
    retryCount: number
): Promise<void> {
    // Record failure for aggregation
    failureAggregator.recordFailure(userId, walletAddress, error);

    // Only send individual alert if user hasn't been alerted in last hour
    if (failureAggregator.shouldAlertForUser(userId)) {
        failureAggregator.markUserAlerted(userId);

        await sendDiscordAlert({
            title: '❌ コントラクト更新失敗',
            description: `ユーザー${userId}のティア更新が${retryCount}回の試行後に失敗しました。`,
            color: AlertColor.ERROR,
            fields: [
                { name: 'ユーザーID', value: `${userId}`, inline: true },
                { name: 'ウォレットアドレス', value: `\`${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}\``, inline: true },
                { name: 'リトライ回数', value: `${retryCount}回`, inline: true },
                { name: 'エラーメッセージ', value: `\`\`\`${sanitizeLogText(error.message).slice(0, 500)}\`\`\``, inline: false },
                { name: '🔄 次のアクション', value: '次回の毎時スケジュール更新で自動的に再試行されます。\n同一エラーが複数発生した場合は、5分ごとに集約通知が送信されます。', inline: false }
            ]
        }, 'tierScheduler');
    }
}

/**
 * Alert: Gas price spike detected
 */
export async function alertGasPriceSpike(
    currentGasPrice: bigint,
    averageGasPrice: bigint,
    percentageIncrease: number
): Promise<void> {
    const currentInGwei = ethers.formatUnits(currentGasPrice, 'gwei');
    const averageInGwei = ethers.formatUnits(averageGasPrice, 'gwei');

    await sendDiscordAlert({
        title: '📈 ガス価格急騰検出',
        description: `ネットワークのガス価格が**${percentageIncrease.toFixed(0)}%**上昇しました！`,
        color: AlertColor.WARNING,
        fields: [
            { name: '現在のガス価格', value: `**${currentInGwei} Gwei**`, inline: true },
            { name: '平均ガス価格', value: `${averageInGwei} Gwei`, inline: true },
            { name: '上昇率', value: `**+${percentageIncrease.toFixed(0)}%**`, inline: true },
            { name: '💡 備考', value: 'ガス価格の下落を待つため、コントラクト更新が遅延する場合があります。', inline: false }
        ]
    }, 'walletBalanceMonitor');
}

/**
 * Alert: WebSocket disconnected (enhanced with diagnostic info)
 */
export async function alertWebSocketDisconnected(
    reconnectAttempts: number,
    options?: {
        provider?: string;
        chain?: string;
        closeCode?: number;
        closeReason?: string;
        lastBlockNumber?: number;
        downtimeSeconds?: number;
    }
): Promise<void> {
    const provider = options?.provider || 'QuickNode';
    const chain = options?.chain || CHAIN_NAME;
    const closeCode = options?.closeCode;
    const closeReason = options?.closeReason || 'Unknown';
    const lastBlock = options?.lastBlockNumber;
    const downtime = options?.downtimeSeconds;

    // Determine disconnect type from close code
    let disconnectType = '不明';
    let suggestedAction = '再接続を試行中...';

    if (closeCode !== undefined) {
        if (closeCode === 1000) disconnectType = '正常終了';
        else if (closeCode === 1001) disconnectType = 'エンドポイント消失';
        else if (closeCode === 1002) disconnectType = 'プロトコルエラー';
        else if (closeCode === 1003) disconnectType = 'データ型エラー';
        else if (closeCode === 1006) disconnectType = '異常切断 (DNS/TLS/接続エラー)';
        else if (closeCode === 1008) disconnectType = 'ポリシー違反';
        else if (closeCode === 1011) disconnectType = 'サーバーエラー';
        else disconnectType = `コード: ${closeCode}`;

        if (closeCode === 1006) {
            suggestedAction = 'DNS/TLS/接続エラーを確認。プロバイダー障害の可能性があります。';
        } else if (closeCode === 401) {
            suggestedAction = '認証エラー。APIキーを確認してください。';
        } else if (closeCode === 429) {
            suggestedAction = 'レート制限に達しました。しばらく待機してください。';
        }
    }

    const severity = reconnectAttempts >= 10 ? AlertColor.CRITICAL : AlertColor.WARNING;

    await sendDiscordAlert({
        title: reconnectAttempts >= 10 ? '🔌 WebSocket接続切断: CRITICAL' : '🔌 WebSocket接続切断',
        description: reconnectAttempts >= 10
            ? '**最大再接続試行回数に到達しました。** 手動確認が必要です。'
            : 'リアルタイムイベントリスナーが切断されました。再接続を試行中...',
        color: severity,
        fields: [
            { name: 'プロバイダー', value: `\`${provider}\``, inline: true },
            { name: 'チェーン', value: `\`${chain}\``, inline: true },
            { name: '再接続試行回数', value: `${reconnectAttempts}/10回`, inline: true },
            { name: '切断タイプ', value: `\`${disconnectType}\``, inline: false },
            ...(closeCode !== undefined ? [{ name: 'Close Code', value: `\`${closeCode}\``, inline: true }] : []),
            ...(closeReason ? [{ name: 'Close Reason', value: `\`${closeReason}\``, inline: true }] : []),
            ...(lastBlock ? [{ name: '最後に受信したブロック', value: `#${lastBlock}`, inline: true }] : []),
            ...(downtime ? [{ name: 'ダウンタイム', value: `${downtime}秒`, inline: true }] : []),
            { name: '🔧 推奨アクション', value: suggestedAction, inline: false },
            { name: '⚠️  影響', value: reconnectAttempts >= 10
                ? '**CRITICAL**: リアルタイム処理が停止しています。日次バッチフォールバック（22:00 UTC）で補完されますが、手動確認が必要です。'
                : '再接続が成功するまで、新規トランザクションがリアルタイム処理されない可能性があります。日次バッチフォールバックで未処理分を補完します。', inline: false }
        ]
    }, 'realtimeEventListener');
}

/**
 * Alert: WebSocket reconnected (real-time processing restored)
 * Sent to #system-alert so admins know they do not need to run daily batch manually.
 */
export async function alertWebSocketReconnected(): Promise<void> {
    await sendDiscordAlert({
        title: '✅ WebSocket 再接続完了',
        description: 'リアルタイムイベントリスナーが復旧しました。新規トランザクションはリアルタイムで処理されます。',
        color: AlertColor.INFO,
        fields: [
            { name: 'ステータス', value: '✅ WebSocket 接続正常', inline: false },
            { name: '📋 備考', value: '日次バッチを手動で実行する必要はありません。リアルタイム処理で十分です。', inline: false }
        ]
    }, 'realtimeEventListener');
}

/**
 * Alert: QuickNode fallback to Etherscan (transparency)
 */
export async function alertQuickNodeFallback(
    reason: 'credits_exhausted' | 'service_unavailable' | 'rate_limit',
    creditsUsed?: number,
    creditsLimit?: number
): Promise<void> {
    const reasonText = {
        'credits_exhausted': 'クレジット上限到達',
        'service_unavailable': 'サービス利用不可',
        'rate_limit': 'レート制限'
    }[reason];

    await sendDiscordAlert({
        title: '🔄 QuickNode → Etherscan フォールバック',
        description: `QuickNodeからEtherscan APIへの自動フォールバックが発生しました。`,
        color: AlertColor.WARNING,
        fields: [
            { name: 'フォールバック理由', value: `\`${reasonText}\``, inline: true },
            ...(creditsUsed && creditsLimit ? [
                { name: 'クレジット使用率', value: `${((creditsUsed / creditsLimit) * 100).toFixed(1)}%`, inline: true }
            ] : []),
            { name: '⚠️  機能制限', value: '• リアルタイム反映が遅延する可能性があります\n• 追跡精度が若干低下する可能性があります\n• Etherscan APIのレート制限に依存します', inline: false },
            { name: '📋 監視', value: 'QuickNodeが復旧したら自動的に切り戻します。状態変更時に通知します。', inline: false }
        ]
    }, 'quicknodeRpcService');
}

/**
 * Alert: QuickNode service restored
 */
export async function alertQuickNodeRestored(): Promise<void> {
    await sendDiscordAlert({
        title: '✅ QuickNode サービス復旧',
        description: 'QuickNodeサービスが復旧し、Etherscanから自動的に切り戻しました。',
        color: AlertColor.INFO,
        fields: [
            { name: 'ステータス', value: '✅ QuickNodeが正常に動作しています', inline: false },
            { name: '📋 備考', value: 'リアルタイム処理と追跡精度が通常通りに戻りました。', inline: false }
        ]
    }, 'quicknodeRpcService');
}

/**
 * Alert: QuickNode credits running low
 */
export async function alertQuickNodeCreditsLow(
    creditsUsed: number,
    creditsLimit: number,
    percentageUsed: number,
    daysRemaining: number
): Promise<void> {
    await sendDiscordAlert({
        title: '💳 QuickNodeクレジット警告',
        description: `QuickNode APIクレジットが月間上限の**${percentageUsed.toFixed(1)}%**に達しました！`,
        color: AlertColor.WARNING,
        fields: [
            { name: '使用済みクレジット', value: `**${(creditsUsed / 1_000_000).toFixed(2)}M** / ${(creditsLimit / 1_000_000).toFixed(0)}M`, inline: true },
            { name: 'リセットまでの日数', value: `約${daysRemaining}日`, inline: true },
            { name: '使用率', value: `**${percentageUsed.toFixed(1)}%**`, inline: true },
            { name: '📋 ステータス', value: percentageUsed >= 90
                ? '⚠️  **まもなくEtherscan APIにフォールバックします**\nフォールバック時に通知が送信されます。'
                : 'クレジット節約のため、自動的にレート制限が適用されています。', inline: false }
        ]
    }, 'quicknodeRpcService');
}

/**
 * Alert: Multiple contract update failures
 */
export async function alertMultipleFailures(
    failedCount: number,
    totalUsers: number
): Promise<void> {
    await sendDiscordAlert({
        title: '🚨 複数コントラクト更新失敗',
        description: `**${totalUsers}**件中**${failedCount}**件のコントラクト更新が失敗しました！`,
        color: AlertColor.CRITICAL,
        fields: [
            { name: '失敗件数', value: `**${failedCount}**`, inline: true },
            { name: '総更新件数', value: `${totalUsers}`, inline: true },
            { name: '失敗率', value: `**${((failedCount / totalUsers) * 100).toFixed(1)}%**`, inline: true },
            { name: '⚠️  考えられる原因', value: '• 管理ウォレットのガス不足\n• ネットワーク混雑\n• コントラクトの問題\n• RPCプロバイダーのダウン', inline: false },
            { name: '🔧 必要な対応', value: '**すぐに調査してください！**\n1. 管理ウォレット残高を確認\n2. RPCプロバイダー状態を確認\n3. ログファイルで詳細エラーを確認', inline: false }
        ]
    }, 'tierScheduler');
}

/**
 * Alert: System health check passed (daily summary)
 */
export async function sendDailyHealthSummary(stats: {
    totalTransactions: number;
    successfulUpdates: number;
    failedUpdates: number;
    avgGasUsed: string;
    totalGasCost: string;
    adminWalletBalance: string;
    websocketUptime: number;
    quicknodeCreditsUsed: number;
}): Promise<void> {
    const successRate = ((stats.successfulUpdates / (stats.successfulUpdates + stats.failedUpdates)) * 100).toFixed(1);

    await sendDiscordAlert({
        title: '📊 日次システムレポート',
        description: `${new Date().toLocaleDateString('ja-JP')}のシステム稼働状況`,
        color: AlertColor.INFO,
        fields: [
            { name: '📈 総トランザクション数', value: `${stats.totalTransactions}`, inline: true },
            { name: '✅ 成功した更新', value: `${stats.successfulUpdates}`, inline: true },
            { name: '❌ 失敗した更新', value: `${stats.failedUpdates}`, inline: true },
            { name: '📊 成功率', value: `**${successRate}%**`, inline: true },
            { name: '⛽ 平均ガス使用量', value: `${stats.avgGasUsed}`, inline: true },
            { name: '💰 総ガス費用', value: `**${stats.totalGasCost} BNB**`, inline: true },
            { name: '💳 管理ウォレット残高', value: `**${stats.adminWalletBalance} BNB**`, inline: true },
            { name: '🔌 WebSocket稼働率', value: `${stats.websocketUptime.toFixed(1)}%`, inline: true },
            { name: '📡 QuickNodeクレジット', value: `${(stats.quicknodeCreditsUsed / 1_000_000).toFixed(2)}M`, inline: true }
        ]
    }, 'dailyHealthCheck');
}

/**
 * Alert: Healthcheck failed (external monitoring)
 */
export async function alertHealthcheckFailed(
    downtimeSeconds: number,
    lastSuccessfulCheck?: Date
): Promise<void> {
    await sendDiscordAlert({
        title: '💔 ヘルスチェック失敗: CRITICAL',
        description: `**${Math.floor(downtimeSeconds / 60)}分間**ヘルスチェックが応答していません。`,
        color: AlertColor.CRITICAL,
        fields: [
            { name: 'ダウンタイム', value: `**${Math.floor(downtimeSeconds / 60)}分**`, inline: true },
            { name: '最後の成功チェック', value: lastSuccessfulCheck
                ? new Date(lastSuccessfulCheck).toISOString()
                : '不明', inline: true },
            { name: '⚠️  影響', value: 'アプリケーションが完全に停止している可能性があります。\nDiscord通知も送信できない状態です。', inline: false },
            { name: '🔧 必要な対応', value: '1. サーバー状態を確認\n2. プロセスが実行中か確認\n3. ログファイルを確認\n4. 必要に応じて再起動', inline: false }
        ]
    }, 'healthcheck');
}

// Legacy function names for backward compatibility
export const alertLowBalance = alertBalanceCritical;
export const alertBalanceRunningOut = alertBalanceWarning;

export default {
    sendDiscordAlert,
    alertBalanceCritical,
    alertBalanceWarning,
    alertBalanceInfo,
    alertContractUpdateFailed,
    alertGasPriceSpike,
    alertWebSocketDisconnected,
    alertWebSocketReconnected,
    alertQuickNodeFallback,
    alertQuickNodeRestored,
    alertQuickNodeCreditsLow,
    alertMultipleFailures,
    sendDailyHealthSummary,
    alertHealthcheckFailed,
    // Legacy exports
    alertLowBalance,
    alertBalanceRunningOut
};
