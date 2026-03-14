import React from 'react';
import { Users, FileQuestion, DollarSign, Crown } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import type { PlatformStatistics } from '@/types/dashboard';
import { formatCurrency } from '@/lib/currency-formatter';

interface KPICardsProps {
    stats: PlatformStatistics['platform'] & PlatformStatistics['revenue'] & {
        submissionsToday: number;
        revenueToday: number;
    };
}

export function KPICards({ stats }: KPICardsProps) {
    const t = useTranslations('admin.dashboard');
    const locale = useLocale();

    const cards = [
        {
            title: t('kpi.userBase'),
            value: stats.totalUsers.toLocaleString(),
            subText: t('kpi.activeUsers', { count: stats.activeUsers.toLocaleString() }),
            icon: Users,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
        },
        {
            title: t('kpi.problems'),
            value: stats.totalProblems.toLocaleString(),
            subText: t('kpi.activeProblems', { count: stats.activeProblems.toLocaleString() }),
            icon: FileQuestion,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20',
        },
        {
            title: t('kpi.monthlyRevenue'),
            value: formatCurrency(stats.revenueThisMonth, locale),
            subText: t('kpi.revenueToday', { amount: formatCurrency(stats.revenueToday, locale) }),
            icon: DollarSign,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/20',
        },
        {
            title: t('kpi.premiumHealth'),
            value: stats.totalPremiumUsers.toLocaleString(),
            subText: t('kpi.conversionRate', { rate: stats.premiumConversionRate.toFixed(1) }),
            icon: Crown,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`p-6 rounded-xl border ${card.borderColor} bg-card shadow-sm transition-all duration-200 hover:shadow-md`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${card.bgColor}`}>
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            {card.title}
                        </h3>
                        <div className="text-2xl font-bold mb-1">{card.value}</div>
                        <p className="text-xs text-muted-foreground">{card.subText}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
