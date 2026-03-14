import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueChartItem } from '@/types/subscription-plan';
import { useTranslations, useLocale } from 'next-intl';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, parseISO } from 'date-fns';
import { formatCurrency, formatCurrencyShort, getCurrencyCode } from '@/lib/currency-formatter';

interface RevenueChartProps {
    data: RevenueChartItem[];
    period?: 'day' | 'month' | 'year';
}

export function RevenueChart({ data, period = 'year' }: RevenueChartProps) {
    const t = useTranslations('StatisticsPage');
    const locale = useLocale();

    const formatXAxis = (tickItem: string) => {
        if (!tickItem) return '';
        try {
            if (period === 'day') {
                // tickItem is YYYY-MM-DD
                return format(parseISO(tickItem), 'dd-MM-yy');
            } else if (period === 'month') {
                // tickItem is YYYY-MM
                return format(parseISO(tickItem + '-01'), 'MM-yy');
            } else if (period === 'year') {
                // tickItem is YYYY
                return tickItem;
            } else {
                return tickItem;
            }
        } catch (e) {
            return tickItem;
        }
    };

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>{t('revenue')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatXAxis}
                            />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => formatCurrencyShort(value, locale)} />
                            <Tooltip
                                formatter={(value: any) => [formatCurrency(value, locale), t('revenue')]}
                                cursor={{ fill: 'transparent' }}
                                labelFormatter={formatXAxis}
                            />
                            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
