'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip } from '@/components/ui/tooltip';
import type { CostRecord, Provider } from '@/types/provider-costs';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

const PROVIDER_COLORS: Record<Provider, string> = {
  langsmith: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  deepgram: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  elevenlabs: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  brevo: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const PROVIDER_LABELS: Record<Provider, string> = {
  langsmith: 'LangSmith',
  deepgram: 'Deepgram',
  elevenlabs: 'ElevenLabs',
  brevo: 'Brevo',
};

const ALL_PROVIDERS: Provider[] = ['langsmith', 'deepgram', 'elevenlabs', 'brevo'];

function formatMetrics(record: CostRecord): string {
  const m = record.rawMetrics;
  if (!m) return '—';
  switch (record.provider) {
    case 'langsmith':
      return `${m.rootTraceCount ?? '?'} traces · ${(m.totalTokens ?? 0).toLocaleString()} tokens`;
    case 'deepgram':
      return `${m.requestCount ?? '?'} req · ${((m.totalAudioSeconds ?? 0) / 60).toFixed(1)} min`;
    case 'elevenlabs':
      return `${(m.totalCharacters ?? 0).toLocaleString()} chars`;
    case 'brevo':
      return `${m.emailsSent ?? '?'} sent · ${m.delivered ?? '?'} delivered`;
    default:
      return Object.entries(m)
        .slice(0, 2)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' · ');
  }
}

interface ProviderCostsTableProps {
  records: CostRecord[];
  isLoading: boolean;
  total: number;
  page: number;
  limit: number;
  providerFilter: Provider | 'all';
  currency: string;
  onPageChange: (page: number) => void;
  onProviderFilterChange: (value: Provider | 'all') => void;
  onLimitChange: (value: number) => void;
}

export function ProviderCostsTable({
  records,
  isLoading,
  total,
  page,
  limit,
  providerFilter,
  currency,
  onPageChange,
  onProviderFilterChange,
  onLimitChange,
}: ProviderCostsTableProps) {
  const t = useTranslations('Subscription.providerCosts');
  const totalPages = Math.ceil(total / limit);
  const showConverted = currency !== 'USD';

  const formatCost = (usd: number, converted: number) => {
    if (!showConverted) return `$${usd.toFixed(4)}`;
    return (
      <span>
        <span className="font-medium">
          {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(converted)} {currency}
        </span>
        <span className="text-slate-400 ml-1.5 text-xs">(${usd.toFixed(4)})</span>
      </span>
    );
  };

  return (
    <div className="space-y-3">
      {/* Table controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={providerFilter}
          onValueChange={(v) => onProviderFilterChange(v as Provider | 'all')}
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder={t('controls.allProviders')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('controls.allProviders')}</SelectItem>
            {ALL_PROVIDERS.map((p) => (
              <SelectItem key={p} value={p}>
                {PROVIDER_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto text-sm text-slate-500 dark:text-slate-400">
          <span>{t('controls.rows')}:</span>
          <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
            <SelectTrigger className="w-[70px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>
            {total === 0 ? '0' : `${(page - 1) * limit + 1}–${Math.min(page * limit, total)}`} {t('table.of')}{' '}
            {total}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-700/20">
              <TableHead>{t('table.provider')}</TableHead>
              <TableHead>{t('table.date')}</TableHead>
              <TableHead>
                <span className="flex items-center gap-1">
                  {t('table.usage')}
                  <Tooltip content={t('table.usageTooltip')} side="top">
                    <Info className="w-3.5 h-3.5 text-slate-400 cursor-default" />
                  </Tooltip>
                </span>
              </TableHead>
              <TableHead className="text-right">{t('table.cost')}</TableHead>
              <TableHead className="text-right text-slate-400 text-xs font-normal">
                {t('table.fetchedAt')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-4 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500 dark:text-slate-400">
                  {t('table.noRecords')}
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <TableCell>
                    <Badge className={`${PROVIDER_COLORS[record.provider]} border-0 text-xs font-medium`}>
                      {PROVIDER_LABELS[record.provider]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700 dark:text-slate-300">
                    {format(new Date(record.periodStart), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400 font-mono text-xs">
                    {formatMetrics(record)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium text-slate-800 dark:text-slate-200">
                    {formatCost(record.computedCostUsd, record.computedCost)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-slate-400 dark:text-slate-500">
                    {format(new Date(record.fetchedAt), 'dd/MM HH:mm')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="py-3 px-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('table.page')} {page} {t('table.of')} {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
