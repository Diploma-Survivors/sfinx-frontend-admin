'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { RevenueStats, subscriptionService } from '@/services/subscription-service';
import { toastService } from '@/services/toasts-service';
import { StatisticsHeader } from '@/components/subscriptions/statistics/statistics-header';
import { StatisticsMetrics } from '@/components/subscriptions/statistics/statistics-metrics';
import { RevenueChart } from '@/components/subscriptions/statistics/revenue-chart';
import { PlanDistributionChart } from '@/components/subscriptions/statistics/plan-distribution-chart';
import { subDays, subMonths, subYears } from 'date-fns';
import { StatisticsSkeleton } from '@/components/subscriptions/statistics/statistics-skeleton';
import { ProviderCostsSection } from '@/components/subscriptions/statistics/provider-costs-section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TAB_STORAGE_KEY = 'statistics-active-tab';
const VALID_TABS = ['revenue', 'provider-costs'] as const;
type TabValue = (typeof VALID_TABS)[number];

export default function StatisticsPage() {
    const t = useTranslations('StatisticsPage');
    const [activeTab, setActiveTab] = useState<TabValue>('revenue');
    const [stats, setStats] = useState<RevenueStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<'day' | 'month' | 'year'>('day');
    const [limit, setLimit] = useState<number>(5);

    // Restore persisted tab on mount (survives locale navigation)
    useEffect(() => {
        const saved = sessionStorage.getItem(TAB_STORAGE_KEY);
        if (saved && VALID_TABS.includes(saved as TabValue)) {
            setActiveTab(saved as TabValue);
        }
    }, []);

    const handleTabChange = (tab: string) => {
        const value = tab as TabValue;
        setActiveTab(value);
        sessionStorage.setItem(TAB_STORAGE_KEY, value);
    };

    useEffect(() => {
        setLimit(5);
    }, [period]);

    useEffect(() => {
        fetchStats();
    }, [period, limit]);

    const getQuery = (period: 'day' | 'month' | 'year', limit: number) => {
        const now = new Date();
        const endDate = now.toISOString().split('T')[0];
        let startDate = '';
        let groupBy: 'day' | 'week' | 'month' | 'year' = 'day';

        if (period === 'day') {
            startDate = subDays(now, limit - 1).toISOString().split('T')[0];
            groupBy = 'day';
        } else if (period === 'month') {
            startDate = subMonths(now, limit - 1).toISOString().split('T')[0];
            groupBy = 'month';
        } else if (period === 'year') {
            startDate = subYears(now, limit - 1).toISOString().split('T')[0];
            groupBy = 'year';
        }

        return { startDate, endDate, groupBy };
    };

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const query = getQuery(period, limit);
            const response = await subscriptionService.getRevenueStats(query);
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load statistics:', error);
            toastService.error('Failed to load statistics');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="mb-6">
                    <TabsTrigger value="revenue">{t('tabs.revenue')}</TabsTrigger>
                    <TabsTrigger value="provider-costs">{t('tabs.providerCosts')}</TabsTrigger>
                </TabsList>

                <TabsContent value="revenue">
                    {isLoading ? (
                        <StatisticsSkeleton />
                    ) : stats ? (
                        <>
                            <StatisticsHeader
                                period={period}
                                setPeriod={setPeriod}
                                limit={limit}
                                setLimit={setLimit}
                                isLoading={isLoading}
                                onRefresh={fetchStats}
                            />
                            <StatisticsMetrics stats={stats} period={period} />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <RevenueChart data={stats.revenueByMonth} period={period} />
                                <PlanDistributionChart data={stats.subscriptionsByPlan} />
                            </div>
                        </>
                    ) : null}
                </TabsContent>

                <TabsContent value="provider-costs">
                    <ProviderCostsSection />
                </TabsContent>
            </Tabs>
        </div>
    );
}
