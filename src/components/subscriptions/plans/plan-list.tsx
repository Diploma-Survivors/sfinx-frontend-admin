import { SubscriptionPlan } from '@/types/subscription-plan';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Edit, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PlanListProps {
    plans: SubscriptionPlan[];
    onEdit: (plan: SubscriptionPlan) => void;
    onDelete: (plan: SubscriptionPlan) => void;
}

export function PlanList({ plans, onEdit, onDelete }: PlanListProps) {
    const t = useTranslations('Subscription');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
                <Card key={plan.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                <CardDescription className="mt-2 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                                    ${plan.priceUsd} <span className="text-sm font-normal text-slate-500">/ {plan.durationMonths === 1 ? 'month' : 'year'}</span>
                                </CardDescription>
                            </div>
                            <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                                {plan.isActive ? t('status.active') : t('status.inactive')}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{plan.description}</p>
                        <ul className="space-y-3">
                            {plan.features.map((feature) => (
                                <li key={feature.id} className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <span className="text-slate-700 dark:text-slate-200 font-medium">{feature.name}</span>
                                        {feature.description && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{feature.description}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t p-4">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => onEdit(plan)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">{t('editPlan')}</span>
                        </Button>
                        <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onDelete(plan)}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
