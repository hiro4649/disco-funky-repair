"use client";
import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  PlayCircle,
  Wifi,
  Server,
  Info,
} from "lucide-react";
import { useTranslations } from "next-intl";
import apiClient from "../../../../utils/apiClient";

interface RealtimeStatus {
  success: boolean;
  timestamp: string;
  websocket: {
    connected: boolean;
    reconnectAttempts: number;
    message?: string;
  };
  quicknodeRpc: {
    available: boolean;
    failureCount: number;
  };
  realtimeHealthy: boolean;
}

export default function DailyBatchFallback() {
  const t = useTranslations("Admin");
  const [status, setStatus] = useState<RealtimeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<{ success: boolean; message?: string; durationSeconds?: number } | null>(null);

  const fetchStatus = async () => {
    try {
      const { data } = await apiClient.get<RealtimeStatus>(
        "/monitoring/realtime-status"
      );
      setStatus(data);
    } catch (error) {
      console.error("Failed to fetch realtime status:", error);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const runDailyBatch = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const { data } = await apiClient.post<{
        success: boolean;
        message?: string;
        durationSeconds?: number;
        error?: string;
      }>("/monitoring/run-daily-batch");
      if (data.success) {
        setRunResult({
          success: true,
          message: data.message,
          durationSeconds: data.durationSeconds,
        });
        fetchStatus();
      } else {
        setRunResult({
          success: false,
          message: data.error || "Run failed",
        });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string }; status?: number } };
      const message =
        err.response?.data?.error ||
        (error instanceof Error ? error.message : "Request failed");
      setRunResult({
        success: false,
        message: err.response?.status === 401 ? "Unauthorized. Please sign in again." : message,
      });
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("Daily Batch Fallback")}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {t("Real-time status and manual run for holding date updates when WebSocket or RPC is down.")}
        </p>
      </div>

      {/* Real-time status */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Wifi className="h-5 w-5" />
          {t("Real-time status")}
        </h2>
        {status ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className={`flex items-center justify-between rounded-lg border p-4 ${
                status.websocket.connected
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <span className="font-medium text-gray-700">
                {t("WebSocket")}
              </span>
              <span className="flex items-center gap-2">
                {status.websocket.connected ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-700">{t("Connected")}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <span className="text-amber-700">{t("Disconnected")}</span>
                    {status.websocket.reconnectAttempts > 0 && (
                      <span className="text-xs text-amber-600">
                        ({status.websocket.reconnectAttempts} {t("retries")})
                      </span>
                    )}
                  </>
                )}
              </span>
            </div>
            <div
              className={`flex items-center justify-between rounded-lg border p-4 ${
                status.quicknodeRpc.available
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <span className="font-medium text-gray-700">
                {t("QuickNode RPC")}
              </span>
              <span className="flex items-center gap-2">
                {status.quicknodeRpc.available ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-700">{t("Available")}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <span className="text-amber-700">{t("Fallback mode")}</span>
                  </>
                )}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t("Failed to load status")}</p>
        )}
        {status && (
          <p className="mt-3 text-xs text-gray-500">
            {t("Last updated")}: {new Date(status.timestamp).toLocaleString()}
          </p>
        )}
      </div>

      {/* When to run */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">{t("When to run daily batch")}</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>{t("WebSocket or RPC is down — Discord #system-alert was notified.")}</li>
            <li>{t("Run manually here to catch missed transactions instead of waiting for 22:00 UTC.")}</li>
            <li>{t("When WebSocket or RPC is back, Discord will notify; no need to run daily batch.")}</li>
          </ul>
        </div>
      </div>

      {/* Run daily batch now */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Server className="h-5 w-5" />
          {t("Run daily batch now")}
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          {t("Runs the same logic as the 22:00 UTC cron: processes users not updated in the last 24 hours. Use when real-time is down.")}
        </p>
        <button
          onClick={runDailyBatch}
          disabled={running}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {running ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          {running ? t("Running...") : t("Run daily batch now")}
        </button>
        {runResult && (
          <div
            className={`mt-4 rounded-lg border p-3 text-sm ${
              runResult.success
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {runResult.success ? (
              <>
                <span className="font-medium">{runResult.message}</span>
                {runResult.durationSeconds != null && (
                  <span className="ml-2">
                    ({runResult.durationSeconds.toFixed(1)}s)
                  </span>
                )}
              </>
            ) : (
              <span>{runResult.message}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
