import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionPlanStats } from '@/types/subscription-plan';
import { useTranslations } from 'next-intl';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface PlanDistributionChartProps {
    data: SubscriptionPlanStats[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

export function PlanDistributionChart({ data }: PlanDistributionChartProps) {
    const t = useTranslations('Subscription');

    return (
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
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="plan"
                                label={(props: any) => `${props.name} ${(props.percent ? props.percent * 100 : 0).toFixed(0)}%`}
                            >
                                {data.map((entry, index) => (
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
    );
}
