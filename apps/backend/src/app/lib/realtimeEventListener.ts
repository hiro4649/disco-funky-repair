/**
 * Real-Time Event Listener
 *
 * Listens to Transfer events from the token contract via WebSocket
 * and triggers real-time holding date updates for affected users.
 *
 * Key Features:
 * - WebSocket connection to BSC node
 * - Auto-reconnect on disconnect
 * - Processes only registered users
 * - Triggers immediate holding date recalculation
 * - Queues users for tier update check
 */

import { ethers } from 'ethers';
import prisma from '../db/prisma_client';
import { processUserRealtime } from './realtimeHoldingDateUpdater';
import { alertWebSocketDisconnected, alertWebSocketReconnected } from './discordAlerts';
import { CHAIN_NAME, QUICKNODE_WS_RPC_URL, TOKEN_CONTRACT_ADDRESS } from '../config/env';
import { safeLogError, safeLogWarn, sanitizeLogText } from '../utils/safeLogger';


// Minimal ERC20 ABI for Transfer event
const TOKEN_ABI = [
    'event Transfer(address indexed from, address indexed to, uint256 value)'
];

class RealtimeEventListener {
    private provider: ethers.WebSocketProvider | null = null;
    private contract: ethers.Contract | null = null;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 10;
    private readonly RECONNECT_DELAY = 5000; // 5 seconds
    private lastBlockNumber: number | null = null;
    private disconnectStartTime: number | null = null;

    constructor() {
        if (!QUICKNODE_WS_RPC_URL) {
            safeLogWarn('realtime_event_listener_ws_config_missing', new Error('WebSocket RPC endpoint is not configured'));
            return;
        }

        if (!TOKEN_CONTRACT_ADDRESS) {
            safeLogWarn('realtime_event_listener_token_config_missing', new Error('Token contract address is not configured'));
            return;
        }

        this.connect();
    }

    /**
     * Connect to WebSocket RPC
     */
    private async connect(): Promise<void> {
        try {

            const wsRpcUrl = QUICKNODE_WS_RPC_URL;
            if (!wsRpcUrl) {
                safeLogWarn('realtime_event_listener_ws_config_missing', new Error('WebSocket RPC endpoint is not configured'));
                return;
            }

            this.provider = new ethers.WebSocketProvider(wsRpcUrl);
            this.contract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, this.provider);

            // Set up event listener
            this.contract.on('Transfer', async (from: string, to: string, value: bigint, event: any) => {
                // Track last block number
                if (event?.log?.blockNumber) {
                    this.lastBlockNumber = Number(event.log.blockNumber);
                }
                await this.handleTransferEvent(from, to, value, event);
            });

            // Handle connection events using provider events instead of websocket directly
            this.provider.on('network', async (newNetwork, oldNetwork) => {
                if (oldNetwork === null) {
                    const wasReconnecting = this.reconnectAttempts > 0;
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.disconnectStartTime = null; // Reset on successful connection
                    if (wasReconnecting) {
                        try {
                            await alertWebSocketReconnected();
                        } catch (e) {
                            safeLogError('realtime_event_listener_reconnected_alert', e);
                        }
                    }
                }
            });

            this.provider.on('error', (error: Error) => {
                safeLogError('realtime_event_listener_websocket', error);
                this.isConnected = false;
                this.disconnectStartTime = Date.now();
                this.handleDisconnect(error);
            });


        } catch (error) {
            safeLogError('realtime_event_listener_connect', error);
            this.disconnectStartTime = Date.now();
            this.handleDisconnect(error as Error);
        }
    }

    /**
     * Handle Transfer event
     */
    private async handleTransferEvent(
        from: string,
        to: string,
        value: bigint,
        event: any
    ): Promise<void> {
        try {
            const fromLower = from.toLowerCase();
            const toLower = to.toLowerCase();


            // Extract event data for QuickNode RPC processing
            const eventData = {
                hash: event.log.transactionHash,
                from: fromLower,
                to: toLower,
                value: value,
                blockNumber: event.log.blockNumber
            };


            // Check if from or to are registered users
            const affectedUsers = await prisma.user.findMany({
                where: {
                    wallet_address: {
                        in: [fromLower, toLower]
                    }
                },
                select: {
                    id: true,
                    wallet_address: true
                }
            });

            if (affectedUsers.length === 0) {
                return;
            }


            // Process each affected user in real-time with event data
            for (const user of affectedUsers) {

                try {
                    // Pass event data for QuickNode RPC processing (fast path)
                    await processUserRealtime(user.id, user.wallet_address, eventData);
                } catch (error) {
                    safeLogError('realtime_event_listener_process_user', error, { userId: user.id });
                }
            }

        } catch (error) {
            safeLogError('realtime_event_listener_transfer_event', error);
        }
    }

    /**
     * Handle disconnect and attempt reconnect
     */
    private async handleDisconnect(error?: Error): Promise<void> {
        // Calculate downtime
        const downtimeSeconds = this.disconnectStartTime
            ? Math.floor((Date.now() - this.disconnectStartTime) / 1000)
            : undefined;

        // Try to extract close code and reason from error or provider
        let closeCode: number | undefined;
        let closeReason: string | undefined;

        if (error) {
            closeReason = sanitizeLogText(error.message);
            // Try to extract close code from error message
            const codeMatch = error.message.match(/code[:\s]+(\d+)/i);
            if (codeMatch) {
                closeCode = parseInt(codeMatch[1]);
            }
        }

        // Try to get close code from provider's websocket if available
        try {
            const ws = (this.provider as any)?._websocket;
            if (ws && ws.readyState === WebSocket.CLOSED) {
                // WebSocket is closed, but we can't get close code after the fact
                // This is a limitation - we'd need to track it during close event
            }
        } catch (e) {
            // Ignore
        }

        // Determine provider name from URL
        const providerName = QUICKNODE_WS_RPC_URL?.includes('quicknode') ? 'QuickNode' : 'Unknown';
        const chainName = CHAIN_NAME;

        // Send Discord alert about disconnection with diagnostic info
        try {
            await alertWebSocketDisconnected(this.reconnectAttempts + 1, {
                provider: providerName,
                chain: chainName,
                closeCode,
                closeReason,
                lastBlockNumber: this.lastBlockNumber || undefined,
                downtimeSeconds
            });
        } catch (alertError) {
            safeLogError('realtime_event_listener_disconnect_alert', alertError);
        }

        if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            safeLogWarn('realtime_event_listener_reconnect_exhausted', new Error('WebSocket reconnect attempts exhausted'), {
                reconnectAttempts: this.reconnectAttempts
            });
            return;
        }

        this.reconnectAttempts++;
        const delay = this.RECONNECT_DELAY * this.reconnectAttempts;


        await this.sleep(delay);

        // Clean up old connection
        if (this.provider) {
            try {
                await this.provider.destroy();
            } catch (e) {
                // Ignore cleanup errors
            }
        }

        // Attempt reconnection
        this.connect();
    }

    /**
     * Graceful shutdown
     */
    async stop(): Promise<void> {

        if (this.contract) {
            this.contract.removeAllListeners();
        }

        if (this.provider) {
            await this.provider.destroy();
        }

        this.isConnected = false;
    }

    /**
     * Get connection status
     */
    getStatus(): { connected: boolean; reconnectAttempts: number } {
        return {
            connected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts
        };
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Singleton instance
let eventListener: RealtimeEventListener | null = null;

export const startRealtimeEventListener = (): RealtimeEventListener => {
    if (!eventListener) {
        eventListener = new RealtimeEventListener();
    }
    return eventListener;
};

export const stopRealtimeEventListener = async (): Promise<void> => {
    if (eventListener) {
        await eventListener.stop();
        eventListener = null;
    }
};

export const getEventListenerStatus = (): { connected: boolean; reconnectAttempts: number } | null => {
    return eventListener ? eventListener.getStatus() : null;
};

export default { startRealtimeEventListener, stopRealtimeEventListener, getEventListenerStatus };
