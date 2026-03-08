'use client';

import { ContestHeader } from '@/components/contests/statistics/contest-header';
import { ContestStatisticsSkeleton } from '@/components/contests/statistics/contest-statistics-skeleton';
import { KeyMetrics } from '@/components/contests/statistics/key-metrics';
import { LiveLeaderboard } from '@/components/contests/statistics/live-leaderboard';
import { ProblemHealthWidget } from '@/components/contests/statistics/problem-health';
import { RecentSubmissionsWidget } from '@/components/contests/statistics/recent-submissions';
import { ContestsService } from '@/services/contests-service';
import { toastService } from '@/services/toasts-service';
import { ContestStatistics } from '@/types/contest-statistics';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ContestStatisticsPage() {
    const params = useParams();
    const contestId = Number(params.id);
    const [stats, setStats] = useState<ContestStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const t = useTranslations('ContestStatistics');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await ContestsService.getContestStatistics(contestId);
                const data = response.data.data;
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch contest statistics:', error);
                toastService.error(t('loadError'));
            } finally {
                setLoading(false);
            }
        };

        if (contestId) {
            fetchStats();
        }
    }, [contestId, t]);


    if (loading) {
        return <ContestStatisticsSkeleton />;
    }

    if (!stats) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-500">
                {t('loadError')}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 space-y-6">
            {/* Header Section */}
            <ContestHeader stats={stats} />

            {/* Key Metrics Row */}
            <KeyMetrics stats={stats} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)] min-h-[600px]">
                {/* Left Column: Live Leaderboard (66%) */}
                <div className="lg:col-span-2 h-full">
                    <LiveLeaderboard contestId={contestId} contestStatus={stats.status} />
                </div>

                {/* Right Column: Widgets (33%) */}
                <div className="lg:col-span-1 flex flex-col gap-6 h-full">
                    <div>
                        <ProblemHealthWidget contestId={contestId} />
                    </div>
                    <div>
                        <RecentSubmissionsWidget contestId={contestId} />
                    </div>
                </div>
            </div>
        </div>
    );
}
