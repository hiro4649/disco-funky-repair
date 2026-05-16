"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Cloud,
  Database,
  RefreshCw,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useTranslations } from 'next-intl';
import apiClient from "../../../../utils/apiClient";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface QuickNodeStatus {
  success: boolean;
  timestamp: string;
  services: {
    quickNode: {
      available: boolean;
      failureCount: number;
      credits: {
        used: number;
        usedMillions: number;
        limit: number;
        limitMillions: number;
        percentage: number;
        remaining: number;
        remainingMillions: number;
      };
      projection: {
        dailyUsage: number;
        dailyUsageMillions: number;
        projectedMonthlyUsage: number;
        projectedMonthlyUsageMillions: number;
        projectedPercentage: number;
        daysRemaining: number;
        willExceedLimit: boolean;
      };
      warnings: string[];
    };
    etherscan: {
      available: boolean;
      role: string;
    };
  };
  backgroundJobs: {
    sixHourUpdate: {
      status: string;
      description: string;
    };
  };
}

export default function MonitoringDashboard() {
  const t = useTranslations('Admin');
  const [status, setStatus] = useState<QuickNodeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStatus = async () => {
    try {
      const { data } = await apiClient.get<QuickNodeStatus>(
        "/monitoring/quicknode-status"
      );
      setStatus(data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch monitoring status:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    if (autoRefresh) {
      const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-orange-500";
    if (percentage >= 50) return "text-yellow-500";
    return "text-green-600";
  };

  const getStatusBgColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-50 border-red-200";
    if (percentage >= 75) return "bg-orange-50 border-orange-200";
    if (percentage >= 50) return "bg-yellow-50 border-yellow-200";
    return "bg-green-50 border-green-200";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-orange-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-600">{t('Loading monitoring data...')}</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-sm text-gray-600">{t('Failed to load monitoring data')}</p>
          <button
            onClick={fetchStatus}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            {t('Retry')}
          </button>
        </div>
      </div>
    );
  }

  const creditData = status.services.quickNode.credits;
  const projection = status.services.quickNode.projection;

  // Chart options for credit usage gauge
  const gaugeOptions: any = {
    chart: {
      type: "radialBar",
      offsetY: -20,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: "#e7e7e7",
          strokeWidth: "97%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: "16px",
            fontWeight: 600,
            offsetY: -10,
          },
          value: {
            offsetY: -50,
            fontSize: "32px",
            fontWeight: 700,
            formatter: function (val: number) {
              return val.toFixed(2) + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        shadeIntensity: 0.4,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 53, 91],
        colorStops: [
          {
            offset: 0,
            color: creditData.percentage >= 90 ? "#ef4444" : creditData.percentage >= 75 ? "#f97316" : "#10b981",
            opacity: 1,
          },
          {
            offset: 100,
            color: creditData.percentage >= 90 ? "#dc2626" : creditData.percentage >= 75 ? "#ea580c" : "#059669",
            opacity: 1,
          },
        ],
      },
    },
    labels: ["Credits Used"],
  };

  const gaugeSeries = [creditData.percentage];

  // Chart options for daily usage trend (mock data - you can replace with real historical data)
  const trendOptions: any = {
    chart: {
      type: "area",
      height: 200,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.1,
      },
    },
    xaxis: {
      categories: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Today"],
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: function (val: number) {
          return val.toFixed(2) + "M";
        },
      },
    },
    colors: ["#3b82f6"],
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toFixed(2) + "M credits";
        },
      },
    },
  };

  // Mock daily usage trend (replace with real data from backend if available)
  const trendSeries = [
    {
      name: "Daily Usage",
      data: [
        projection.dailyUsageMillions * 0.8,
        projection.dailyUsageMillions * 0.9,
        projection.dailyUsageMillions * 1.1,
        projection.dailyUsageMillions * 0.95,
        projection.dailyUsageMillions * 1.05,
        projection.dailyUsageMillions * 0.98,
        projection.dailyUsageMillions,
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('System Monitoring')}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {t('QuickNode RPC & explorer API health monitoring')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-gray-700">{t('Auto-refresh (30s)')}</span>
          </label>
          <button
            onClick={fetchStatus}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            {t('Refresh')}
          </button>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-xs text-gray-500">
          {t('Last updated:')} {lastUpdated.toLocaleString()}
        </p>
      )}

      {/* Warnings */}
      {status.services.quickNode.warnings.length > 0 && (
        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">{t('Warnings')}</h3>
              <ul className="mt-2 space-y-1 text-sm text-red-700">
                {status.services.quickNode.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Service Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* QuickNode Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <Cloud className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">QuickNode RPC</p>
                <p className="text-2xl font-bold text-gray-900">
                  {status.services.quickNode.available ? t('Operational') : t('Down')}
                </p>
              </div>
            </div>
            {status.services.quickNode.available ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-500" />
            )}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <Activity className="h-4 w-4" />
            <span>{t('Failures:')} {status.services.quickNode.failureCount}/3</span>
          </div>
        </div>

        {/* Explorer API Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-2">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Explorer API</p>
                <p className="text-2xl font-bold text-gray-900">
                  {status.services.etherscan.available ? t('Operational') : t('Down')}
                </p>
              </div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <span className="rounded-full bg-purple-100 px-2 py-0.5 font-medium text-purple-700">
              {status.services.etherscan.role}
            </span>
          </div>
        </div>

        {/* Daily Usage Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-50 p-2">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('Daily Usage')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projection.dailyUsageMillions}M
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            {projection.dailyUsage.toLocaleString()} {t('credits today')}
          </div>
        </div>

        {/* Background Jobs Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('6-Hour Job')}</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {status.backgroundJobs.sixHourUpdate.status}
                </p>
              </div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4 text-xs text-gray-500">
            {status.backgroundJobs.sixHourUpdate.description}
          </div>
        </div>
      </div>

      {/* Credit Usage Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Credit Gauge */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {t('Credit Usage (Current Month)')}
          </h3>
          <div className="mx-auto max-w-sm">
            <ReactApexChart
              options={gaugeOptions}
              series={gaugeSeries}
              type="radialBar"
              height={280}
            />
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('Used')}</span>
              <span className="font-semibold text-gray-900">
                {creditData.usedMillions}M / {creditData.limitMillions}M
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('Remaining')}</span>
              <span className={`font-semibold ${getStatusColor(creditData.percentage)}`}>
                {creditData.remainingMillions}M
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full transition-all duration-500 ${getProgressColor(creditData.percentage)}`}
                style={{ width: `${creditData.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Daily Usage Trend */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {t('Daily Usage Trend')}
          </h3>
          <ReactApexChart
            options={trendOptions}
            series={trendSeries}
            type="area"
            height={200}
          />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs text-blue-600">{t("Today's Usage")}</p>
              <p className="mt-1 text-xl font-bold text-blue-900">
                {projection.dailyUsageMillions}M
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-xs text-purple-600">{t('Days Remaining')}</p>
              <p className="mt-1 text-xl font-bold text-purple-900">
                {projection.daysRemaining} {t('days')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div
          className={`rounded-lg border p-4 ${getStatusBgColor(projection.projectedPercentage)}`}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <TrendingUp className="h-4 w-4" />
            {t('Projected Monthly Usage')}
          </div>
          <p className={`mt-2 text-2xl font-bold ${getStatusColor(projection.projectedPercentage)}`}>
            {projection.projectedMonthlyUsageMillions}M
          </p>
          <p className="mt-1 text-xs text-gray-600">
            {projection.projectedPercentage.toFixed(2)}% {t('of limit')}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-700">{t('Average Daily Usage')}</div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {projection.dailyUsageMillions}M
          </p>
          <p className="mt-1 text-xs text-gray-600">
            {projection.dailyUsage.toLocaleString()} {t('credits today')}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-700">{t('Credits Used')}</div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {creditData.usedMillions}M
          </p>
          <p className="mt-1 text-xs text-gray-600">
            {creditData.used.toLocaleString()} {t('total')}
          </p>
        </div>

        <div className={`rounded-lg border p-4 ${projection.willExceedLimit ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
          <div className="text-sm font-medium text-gray-700">{t('Status Forecast')}</div>
          <p className={`mt-2 text-2xl font-bold ${projection.willExceedLimit ? "text-red-600" : "text-green-600"}`}>
            {projection.willExceedLimit ? t('At Risk') : t('On Track')}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            {projection.willExceedLimit ? t('May exceed limit') : t('Within budget')}
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">
          {t('QuickNode Build Plan Details')}
        </h3>
        <div className="grid gap-4 text-sm md:grid-cols-3">
          <div>
            <p className="text-gray-600">{t('Monthly Limit')}</p>
            <p className="mt-1 font-semibold text-gray-900">80 {t('Million Credits')}</p>
          </div>
          <div>
            <p className="text-gray-600">{t('Available Endpoints')}</p>
            <p className="mt-1 font-semibold text-gray-900">10 {t('Endpoints')}</p>
          </div>
          <div>
            <p className="text-gray-600">{t('RPS per Endpoint')}</p>
            <p className="mt-1 font-semibold text-gray-900">50 {t('RPS')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
