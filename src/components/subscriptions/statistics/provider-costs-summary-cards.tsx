'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CostSummaryResponse, Provider } from '@/types/provider-costs';
import { DollarSign, Cpu, Mic, Volume2, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

const PROVIDER_META: Record<
  Provider,
  { label: string; icon: React.ElementType; textClass: string; bgClass: string; barColor: string }
> = {
  langsmith: {
    label: 'LangSmith',
    icon: Cpu,
    textClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-900/20',
    barColor: 'oklch(0.55 0.2 280)',
  },
  deepgram: {
    label: 'Deepgram',
    icon: Mic,
    textClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
    barColor: 'oklch(0.55 0.18 160)',
  },
  elevenlabs: {
    label: 'ElevenLabs',
    icon: Volume2,
    textClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    barColor: 'oklch(0.5 0.18 200)',
  },
  brevo: {
    label: 'Brevo',
    icon: Mail,
    textClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
    barColor: 'oklch(0.65 0.18 60)',
  },
};

const ALL_PROVIDERS: Provider[] = ['langsmith', 'deepgram', 'elevenlabs', 'brevo'];

interface ProviderCostsSummaryCardsProps {
  summary: CostSummaryResponse;
}

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatConverted(value: number, currency: string) {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)} ${currency}`;
}

export function ProviderCostsSummaryCards({ summary }: ProviderCostsSummaryCardsProps) {
  const t = useTranslations('Subscription.providerCosts.summary');
  const { totalCost, totalCostUsd, byProvider, currency } = summary;
  const showConverted = currency !== 'USD';

  return (
    <div className="space-y-4">
      {/* Total + distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t('totalCost')}
            </CardTitle>
            <div className="rounded-lg p-2 bg-emerald-50 dark:bg-emerald-900/20">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {showConverted ? formatConverted(totalCost, currency) : formatUsd(totalCostUsd)}
            </div>
            {showConverted && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                ≈ {formatUsd(totalCostUsd)}
              </p>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('allProviders')}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {t('costDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {ALL_PROVIDERS.map((provider) => {
              const entry = byProvider[provider];
              if (!entry) return null;
              const pct = totalCostUsd > 0 ? (entry.costUsd / totalCostUsd) * 100 : 0;
              const meta = PROVIDER_META[provider];
              return (
                <div key={provider} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${meta.textClass}`}>{meta.label}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {formatUsd(entry.costUsd)} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: meta.barColor }}
                    />
                  </div>
                </div>
              );
            })}
            {ALL_PROVIDERS.every((p) => !byProvider[p]) && (
              <p className="text-sm text-slate-400 text-center py-2">{t('noData')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-provider cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ALL_PROVIDERS.map((provider) => {
          const entry = byProvider[provider];
          const meta = PROVIDER_META[provider];
          const Icon = meta.icon;
          return (
            <Card key={provider} className="border-slate-200 dark:border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {meta.label}
                </CardTitle>
                <div className={`rounded-lg p-1.5 ${meta.bgClass}`}>
                  <Icon className={`h-3.5 w-3.5 ${meta.textClass}`} />
                </div>
              </CardHeader>
              <CardContent>
                {entry ? (
                  <>
                    <div className={`text-xl font-bold ${meta.textClass}`}>
                      {formatUsd(entry.costUsd)}
                    </div>
                    {showConverted && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatConverted(entry.cost, currency)}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="text-xl font-bold text-slate-300 dark:text-slate-600">—</div>
                )}
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('thisPeriod')}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
