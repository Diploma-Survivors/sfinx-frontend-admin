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

export default function StatisticsPage() {
    const [stats, setStats] = useState<RevenueStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<'day' | 'month' | 'year'>('day');
    const [limit, setLimit] = useState<number>(5);

    // Update default limit when period changes
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

    if (isLoading) {
        return <StatisticsSkeleton />;
    }

    if (!stats) return null;

    return (
        <div className="container mx-auto px-4 py-8">
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
        </div>
    );
}
