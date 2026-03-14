'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { DashboardService } from '@/services/dashboard-service';
import type { PlatformStatistics } from '@/types/dashboard';
import { KPICards } from '@/components/admin/dashboard/kpi-cards';
import { AnalyticsChart } from '@/components/admin/dashboard/analytics-chart';
import { GrowthEngagementPanels } from '@/components/admin/dashboard/growth-engagement-panels';
import { RevenueSection } from '@/components/admin/dashboard/revenue-section';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
    const t = useTranslations('admin.dashboard');
    const locale = useLocale();
    const [stats, setStats] = useState<PlatformStatistics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await DashboardService.getPlatformStatistics(locale);
                if (response.data.data) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch platform statistics', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [locale]);


    if (loading) {
        return <DashboardSkeleton />;
    }

    if (!stats) {
        return <div>{t('error.failedToLoad')}</div>;
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
            </div>

            <div className="space-y-4">
                {/* Row 1: KPI Cards */}
                <KPICards
                    stats={{
                        ...stats.platform,
                        ...stats.revenue,
                        submissionsToday: stats.growth.submissionsToday,
                        revenueToday: stats.revenue.revenueToday,
                    }}
                />

                {/* Row 2: Main Analytics Chart */}
                <div className="w-full">
                    <AnalyticsChart />
                </div>

                {/* Row 3: Growth & Engagement */}
                <GrowthEngagementPanels
                    growth={stats.growth}
                    engagement={stats.engagement}
                />

                {/* Row 4: Revenue Deep Dive */}
                <RevenueSection revenue={stats.revenue} />
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Skeleton className="h-8 w-[200px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-[120px] rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-[400px] rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Skeleton className="h-[300px] rounded-xl" />
                <Skeleton className="h-[300px] rounded-xl" />
            </div>
            <Skeleton className="h-[100px] rounded-xl" />
        </div>
    );
}
