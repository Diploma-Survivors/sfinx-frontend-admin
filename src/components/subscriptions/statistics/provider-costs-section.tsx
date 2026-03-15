'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { providerCostsService } from '@/services/provider-costs-service';
import { subscriptionService } from '@/services/subscription-service';
import { toastService } from '@/services/toasts-service';
import type { CostRecord, CostSummaryResponse, Provider } from '@/types/provider-costs';
import { format, subDays, startOfMonth } from 'date-fns';
import { RefreshCw, Zap, Calendar } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { FetchNowDialog } from './fetch-now-dialog';
import { ProviderCostsSummaryCards } from './provider-costs-summary-cards';
import { ProviderCostsTable } from './provider-costs-table';
import { ProfitOverviewCard } from './profit-overview-card';

type DatePreset = '7d' | '30d' | 'mtd' | 'custom';

function getPresetDates(preset: Exclude<DatePreset, 'custom'>): { from: string; to: string } {
  const today = new Date();
  const to = format(today, 'yyyy-MM-dd');
  switch (preset) {
    case '7d':
      return { from: format(subDays(today, 6), 'yyyy-MM-dd'), to };
    case '30d':
      return { from: format(subDays(today, 29), 'yyyy-MM-dd'), to };
    case 'mtd':
      return { from: format(startOfMonth(today), 'yyyy-MM-dd'), to };
  }
}

export function ProviderCostsSection() {
  const t = useTranslations('Subscription.providerCosts');
  const locale = useLocale();
  const currency = locale === 'vi' ? 'VND' : 'USD';

  const today = format(new Date(), 'yyyy-MM-dd');
  const [preset, setPreset] = useState<DatePreset>('30d');
  const [from, setFrom] = useState(format(subDays(new Date(), 29), 'yyyy-MM-dd'));
  const [to, setTo] = useState(today);

  const [summary, setSummary] = useState<CostSummaryResponse | null>(null);
  const [records, setRecords] = useState<CostRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [providerFilter, setProviderFilter] = useState<Provider | 'all'>('all');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [isProfitLoading, setIsProfitLoading] = useState(true);
  const [fetchNowOpen, setFetchNowOpen] = useState(false);

  const fetchSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const res = await providerCostsService.getSummary({ from, to, currency });
      setSummary(res.data);
    } catch {
      toastService.error(t('errors.loadSummary'));
    } finally {
      setIsSummaryLoading(false);
    }
  }, [from, to, currency, t]);

  const fetchRecords = useCallback(async () => {
    setIsTableLoading(true);
    try {
      const res = await providerCostsService.listRecords({
        from,
        to,
        currency,
        page,
        limit,
        ...(providerFilter !== 'all' ? { provider: providerFilter } : {}),
      });
      setRecords(res.data.data);
      setTotal(res.data.total);
    } catch {
      toastService.error(t('errors.loadRecords'));
    } finally {
      setIsTableLoading(false);
    }
  }, [from, to, currency, page, limit, providerFilter, t]);

  const fetchRevenue = useCallback(async () => {
    setIsProfitLoading(true);
    try {
      const res = await subscriptionService.getRevenueStats({
        startDate: from,
        endDate: to,
        groupBy: 'day',
      });
      setTotalRevenue(res.data.totalRevenue);
    } catch {
      toastService.error(t('profit.loadError'));
    } finally {
      setIsProfitLoading(false);
    }
  }, [from, to, t]);

  useEffect(() => {
    fetchSummary();
    fetchRevenue();
  }, [fetchSummary, fetchRevenue]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const DATE_PRESETS: { value: DatePreset; label: string }[] = [
    { value: '7d', label: t('datePresets.last7d') },
    { value: '30d', label: t('datePresets.last30d') },
    { value: 'mtd', label: t('datePresets.mtd') },
    { value: 'custom', label: t('datePresets.custom') },
  ];

  const handlePresetChange = (value: DatePreset) => {
    setPreset(value);
    if (value !== 'custom') {
      const dates = getPresetDates(value);
      setFrom(dates.from);
      setTo(dates.to);
      setPage(1);
    }
  };

  const handleFromChange = (value: string) => {
    setFrom(value);
    setPreset('custom');
    setPage(1);
  };

  const handleToChange = (value: string) => {
    setTo(value);
    setPreset('custom');
    setPage(1);
  };

  const handleRefresh = () => {
    fetchSummary();
    fetchRecords();
    fetchRevenue();
  };

  const isLoading = isSummaryLoading || isTableLoading;

  return (
    <div>
      {/* Header — mirrors StatisticsHeader layout exactly */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {t('sectionTitle')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{t('sectionDescription')}</p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
          {/* Row 1: date preset + date range */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Select
              value={preset}
              onValueChange={(v) => handlePresetChange(v as DatePreset)}
            >
              <SelectTrigger className="w-[150px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_PRESETS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => handleFromChange(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              <span className="text-slate-400 text-sm">—</span>
              <input
                type="date"
                value={to}
                min={from}
                max={today}
                onChange={(e) => handleToChange(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
          </div>

          {/* Row 2: action buttons — always on one line */}
          <div className="flex items-center gap-2 shrink-0">
            <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t('controls.refresh')}
            </Button>
            <Button onClick={() => setFetchNowOpen(true)} variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              {t('controls.triggerFetch')}
            </Button>
          </div>
        </div>
      </div>

      {/* Profitability Overview */}
      <div className="mb-8">
        <ProfitOverviewCard
          totalRevenue={totalRevenue ?? 0}
          totalCostUsd={summary?.totalCostUsd ?? 0}
          totalCostConverted={summary?.totalCost ?? 0}
          currency={currency}
          isLoading={isProfitLoading || isSummaryLoading}
        />
      </div>

      {/* Cost summary cards */}
      <div className="mb-8">
        {isSummaryLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
                />
              ))}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : summary ? (
          <ProviderCostsSummaryCards summary={summary} />
        ) : null}
      </div>

      {/* Records table */}
      <ProviderCostsTable
        records={records}
        isLoading={isTableLoading}
        total={total}
        page={page}
        limit={limit}
        providerFilter={providerFilter}
        currency={currency}
        onPageChange={setPage}
        onProviderFilterChange={(v) => {
          setProviderFilter(v);
          setPage(1);
        }}
        onLimitChange={(v) => {
          setLimit(v);
          setPage(1);
        }}
      />

      <FetchNowDialog
        open={fetchNowOpen}
        onOpenChange={setFetchNowOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
