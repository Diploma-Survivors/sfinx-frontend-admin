import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueStats } from '@/types/subscription-plan';
import { Activity, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatisticsMetricsProps {
    stats: RevenueStats;
    period: 'day' | 'month' | 'year';
}

export function StatisticsMetrics({ stats, period }: StatisticsMetricsProps) {
    const t = useTranslations('Subscription');

    // Calculate monthly revenue from revenueByMonth data
    const currentRevenue = stats.revenueByMonth.length > 0
        ? stats.revenueByMonth[stats.revenueByMonth.length - 1].amount
        : 0;

    const getRevenueTitle = () => {
        if (period === 'day') return t('stats.currentDayRevenue');
        if (period === 'month') return t('stats.currentMonthRevenue');
        if (period === 'year') return t('stats.currentYearRevenue');
        return t('stats.currentRevenue');
    };

    const getRevenueDescription = () => {
        if (period === 'day') return t('stats.latestDay');
        if (period === 'month') return t('stats.latestMonth');
        if (period === 'year') return t('stats.latestYear');
        return t('stats.latestPeriod');
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('stats.totalRevenue')}</CardTitle>
                    <DollarSign className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-slate-500">{t('stats.totalRevenueNote')}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{getRevenueTitle()}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${currentRevenue.toLocaleString()}</div>
                    <p className="text-xs text-slate-500">{getRevenueDescription()}</p>
                </CardContent>
            </Card>
            {/* Revenue Growth Card (Replaces Active Subscribers) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('stats.revenueGrowth')}</CardTitle>
                    <TrendingUp className={`h-4 w-4 ${stats.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth}%
                    </div>
                    <p className="text-xs text-slate-500">{t('stats.vsLastPeriod')}</p>
                </CardContent>
            </Card>

            {/* Subscriber Growth Card (Replaces Churn Rate) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{t('stats.subscriberGrowth')}</CardTitle>
                    <Users className={`h-4 w-4 ${stats.subscriberGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${stats.subscriberGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.subscriberGrowth > 0 ? '+' : ''}{stats.subscriberGrowth}%
                    </div>
                    <p className="text-xs text-slate-500">{t('stats.vsLastPeriod')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
