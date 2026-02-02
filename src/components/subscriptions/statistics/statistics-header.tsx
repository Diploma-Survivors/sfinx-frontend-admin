import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SelectLabel } from '@radix-ui/react-select';
import { Calendar, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatisticsHeaderProps {
    period: 'day' | 'month' | 'year';
    setPeriod: (value: 'day' | 'month' | 'year') => void;
    limit: number;
    setLimit: (value: number) => void;
    isLoading: boolean;
    onRefresh: () => void;
}

export function StatisticsHeader({ period, setPeriod, limit, setLimit, isLoading, onRefresh }: StatisticsHeaderProps) {
    const t = useTranslations('StatisticsPage');

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t('title')}</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">{t('description')}</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium whitespace-nowrap">Last</span>
                    <Select value={limit.toString()} onValueChange={(val) => setLimit(Number(val))}>
                        <SelectTrigger className="w-[70px]">
                            <SelectValue placeholder="5" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='1'>1</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="15">15</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Select value={period} onValueChange={(val) => setPeriod(val as 'day' | 'month' | 'year')}>
                    <SelectTrigger className="w-[140px]">
                        <Calendar className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="day">Days</SelectItem>
                        <SelectItem value="month">Months</SelectItem>
                        <SelectItem value="year">Years</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={onRefresh} variant="outline" disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>
        </div>
    );
}
