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
        if (period === 'day') return 'Current Day Revenue';
        if (period === 'month') return 'Current Month Revenue';
        if (period === 'year') return 'Current Year Revenue';
        return 'Current Revenue';
    };

    const getRevenueDescription = () => {
        if (period === 'day') return 'Latest day in chart';
        if (period === 'month') return 'Latest month in chart';
        if (period === 'year') return 'Latest year in chart';
        return 'Latest period in chart';
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
                    <p className="text-xs text-slate-500">Total revenue in selected period</p>
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
                    <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
                    <TrendingUp className={`h-4 w-4 ${stats.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth}%
                    </div>
                    <p className="text-xs text-slate-500">vs last period</p>
                </CardContent>
            </Card>

            {/* Subscriber Growth Card (Replaces Churn Rate) */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Subscriber Growth</CardTitle>
                    <Users className={`h-4 w-4 ${stats.subscriberGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${stats.subscriberGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.subscriberGrowth > 0 ? '+' : ''}{stats.subscriberGrowth}%
                    </div>
                    <p className="text-xs text-slate-500">vs last period</p>
                </CardContent>
            </Card>
        </div>
    );
}
