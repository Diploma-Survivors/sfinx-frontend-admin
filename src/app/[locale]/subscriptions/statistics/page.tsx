'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { RevenueStats, subscriptionService } from '@/services/subscription-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, TrendingUp, Users, DollarSign, Activity, Calendar } from 'lucide-react';
import { toastService } from '@/services/toasts-service';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StatisticsPage() {
    const t = useTranslations('Subscription');
    const [stats, setStats] = useState<RevenueStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

    useEffect(() => {
        fetchStats();
    }, [period]);

    const getDateRange = (period: 'week' | 'month' | 'year') => {
        const now = new Date();
        const startDate = new Date();

        switch (period) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: now.toISOString().split('T')[0]
        };
    };

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const dateRange = getDateRange(period);
            const response = await subscriptionService.getRevenueStats(dateRange);
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load statistics:', error);
            toastService.error('Failed to load statistics');
        } finally {
            setIsLoading(false);
        }
    };

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
                <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!stats) return null;

    // Calculate monthly revenue from revenueByMonth data
    const currentMonthRevenue = stats.revenueByMonth.length > 0
        ? stats.revenueByMonth[stats.revenueByMonth.length - 1].amount
        : 0;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t('statistics')}</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{t('statsDescription')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={period} onValueChange={(val: any) => setPeriod(val)}>
                        <SelectTrigger className="w-[180px]">
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={fetchStats} variant="outline" disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                        <CardTitle className="text-sm font-medium">Current Month Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${currentMonthRevenue.toLocaleString()}</div>
                        <p className="text-xs text-slate-500">Latest month in chart</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('stats.activeSubscribers')}</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeSubscribers.toLocaleString()}</div>
                        <p className="text-xs text-slate-500">+180 new subcribers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('stats.churnRate')}</CardTitle>
                        <Activity className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.churnRate}%</div>
                        <p className="text-xs text-slate-500">-1.2% from last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>{t('stats.revenueOverTime')}</CardTitle>
                        <CardDescription>Monthly revenue for the current year</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.revenueByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip
                                        formatter={(value: any) => [`$${value}`, 'Revenue']}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>{t('stats.subsByPlan')}</CardTitle>
                        <CardDescription>Distribution of active subscriptions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.subscriptionsByPlan}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="plan"
                                        label={(props: any) => `${props.name} ${(props.percent ? props.percent * 100 : 0).toFixed(0)}%`}
                                    >
                                        {stats.subscriptionsByPlan.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
