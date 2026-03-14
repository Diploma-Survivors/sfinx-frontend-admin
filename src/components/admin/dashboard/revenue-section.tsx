import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { PlatformStatistics } from '@/types/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, CreditCard, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/currency-formatter';

interface RevenueSectionProps {
    revenue: PlatformStatistics['revenue'];
}

export function RevenueSection({ revenue }: RevenueSectionProps) {
    const t = useTranslations('admin.dashboard');
    const locale = useLocale();

    return (
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none">
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

                    {/* New Premium Users */}
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/10 rounded-full">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-sm text-slate-400">{t('revenue.newPremiumToday')}</div>
                            <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-bold">{revenue.newPremiumToday}</span>
                                <span className="text-xs text-green-400 font-medium">
                                    +{revenue.newPremiumThisWeek} {t('revenue.thisWeek')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ARPU */}
                    <div className="flex items-center space-x-4 border-l border-white/10 pl-8">
                        <div className="p-3 bg-white/10 rounded-full">
                            <CreditCard className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <div className="text-sm text-slate-400">{t('revenue.arpu')}</div>
                            <div className="text-2xl font-bold">
                                {formatCurrency(revenue.averageRevenuePerUser, locale)}
                            </div>
                        </div>
                    </div>

                    {/* Premium Conversion */}
                    <div className="space-y-2 border-l border-white/10 pl-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-slate-400">{t('revenue.premiumConversion')}</span>
                            </div>
                            <span className="text-xl font-bold">{revenue.premiumConversionRate}%</span>
                        </div>
                        <Progress
                            value={revenue.premiumConversionRate}
                            className="h-2 bg-white/10"
                        // indicatorClassName="bg-yellow-400" // Note: Check if Progress supports this prop or needs custom styling
                        />
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
