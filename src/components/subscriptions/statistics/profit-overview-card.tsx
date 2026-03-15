'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { TrendingUp, TrendingDown, DollarSign, Cpu, Minus } from 'lucide-react';

interface ProfitOverviewCardProps {
  totalRevenue: number;
  totalCostUsd: number;
  currency: string;
  totalCostConverted: number;
  isLoading: boolean;
}

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function ProfitOverviewCard({
  totalRevenue,
  totalCostUsd,
  isLoading,
}: ProfitOverviewCardProps) {
  const t = useTranslations('Subscription.providerCosts.profit');

  const netProfit = totalRevenue - totalCostUsd;
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const isProfitable = netProfit >= 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
          {t('title')}
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500">— {t('samePeriod')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Revenue */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {t('revenue')}
            </CardTitle>
            <div className="rounded-lg p-1.5 bg-emerald-50 dark:bg-emerald-900/20">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {formatUsd(totalRevenue)}
            </div>
          </CardContent>
        </Card>

        {/* API Costs */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {t('apiCosts')}
            </CardTitle>
            <div className="rounded-lg p-1.5 bg-red-50 dark:bg-red-900/20">
              <Cpu className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600 dark:text-red-400">
              {formatUsd(totalCostUsd)}
            </div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card
          className={`border-slate-200 dark:border-slate-700 ${
            isProfitable
              ? 'ring-1 ring-emerald-200 dark:ring-emerald-800'
              : 'ring-1 ring-red-200 dark:ring-red-900'
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {t('grossProfit')}
            </CardTitle>
            <div
              className={`rounded-lg p-1.5 ${
                isProfitable
                  ? 'bg-emerald-50 dark:bg-emerald-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}
            >
              {isProfitable ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl font-bold ${
                isProfitable
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {isProfitable ? '+' : ''}{formatUsd(netProfit)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
              <Minus className="w-3 h-3" />
              {t('margin')}: {Math.abs(margin).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
