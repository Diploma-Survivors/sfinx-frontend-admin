import React, { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useTranslations } from 'next-intl';
import { DashboardService } from '@/services/dashboard-service';
import type { TimeSeriesPoint, DashboardMetric } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon } from 'lucide-react';

export function AnalyticsChart() {
    const t = useTranslations('admin.dashboard');
    const [data, setData] = useState<TimeSeriesPoint[]>([]);
    const [metric, setMetric] = useState<DashboardMetric>('users');
    const [range, setRange] = useState<string>('7d');
    const [loading, setLoading] = useState(false);
    const [customRange, setCustomRange] = useState<{ from: string; to: string }>({
        from: '',
        to: ''
    });
    const [isCustomOpen, setIsCustomOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (range === 'custom' && (!customRange.from || !customRange.to)) {
                return;
            }

            setLoading(true);
            try {
                // Calculate from/to dates based on range
                let to = new Date().toISOString().split('T')[0];
                let from = new Date();

                if (range === '7d') {
                    from.setDate(from.getDate() - 7);
                } else if (range === '30d') {
                    from.setDate(from.getDate() - 30);
                } else if (range === 'month') {
                    from.setDate(1);
                } else if (range === '1y') {
                    from.setFullYear(from.getFullYear() - 1);
                } else if (range === 'custom') {
                    from = new Date(customRange.from);
                    to = customRange.to;
                }

                const fromStr = from.toISOString().split('T')[0];

                const response = await DashboardService.getTimeSeriesMetrics(metric, fromStr, to);
                if (response.data.data) {
                    const dataMap: Record<DashboardMetric, keyof typeof response.data.data> = {
                        users: 'dailyNewUsers',
                        submissions: 'dailySubmissions',
                        active_users: 'dailyActiveUsers',
                    };
                    const chartData = response.data.data[dataMap[metric]] || [];
                    setData(chartData);
                }
            } catch (error) {
                console.error('Failed to fetch time series data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [metric, range, customRange]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <CardTitle className="text-base font-normal">
                    {t('chart.title')}
                </CardTitle>
                <div className="flex items-center space-x-4">
                    <Tabs
                        value={metric}
                        onValueChange={(value) => setMetric(value as DashboardMetric)}
                        className="w-[400px]"
                    >
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="users">{t('chart.metrics.users')}</TabsTrigger>
                            <TabsTrigger value="submissions">
                                {t('chart.metrics.submissions')}
                            </TabsTrigger>
                            <TabsTrigger value="active_users">
                                {t('chart.metrics.activeUsers')}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="flex items-center gap-2">
                        {range === 'custom' && (
                            <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-[240px] justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {customRange.from ? (
                                            customRange.to ? (
                                                <>
                                                    {customRange.from} - {customRange.to}
                                                </>
                                            ) : (
                                                customRange.from
                                            )
                                        ) : (
                                            <span>{t('chart.range.pickDate')}</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4" align="end">
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="grid gap-1">
                                                    <Label htmlFor="from">{t('chart.range.startDate')}</Label>
                                                    <Input
                                                        id="from"
                                                        type="date"
                                                        value={customRange.from}
                                                        onChange={(e) =>
                                                            setCustomRange((prev) => ({ ...prev, from: e.target.value }))
                                                        }
                                                    />
                                                </div>
                                                <div className="grid gap-1">
                                                    <Label htmlFor="to">{t('chart.range.endDate')}</Label>
                                                    <Input
                                                        id="to"
                                                        type="date"
                                                        value={customRange.to}
                                                        onChange={(e) =>
                                                            setCustomRange((prev) => ({ ...prev, to: e.target.value }))
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                        <Select
                            value={range}
                            onValueChange={(value) => {
                                setRange(value);
                                if (value === 'custom') {
                                    setIsCustomOpen(true);
                                }
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('chart.range.placeholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">{t('chart.range.last7Days')}</SelectItem>
                                <SelectItem value="30d">{t('chart.range.last30Days')}</SelectItem>
                                <SelectItem value="month">{t('chart.range.thisMonth')}</SelectItem>
                                <SelectItem value="1y">{t('chart.range.last1Year')}</SelectItem>
                                <SelectItem value="custom">{t('chart.range.custom')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 10,
                                left: 10,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                }}
                                stroke="#888888"
                                fontSize={12}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                stroke="#888888"
                                fontSize={12}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                }}
                                itemStyle={{ color: '#1e293b' }}
                                labelStyle={{ color: '#64748b', marginBottom: '0.25rem' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#8884d8"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
