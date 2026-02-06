import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tooltip } from '@/components/ui/tooltip';
import { usersService } from '@/services/users-service';
import { UserActivityCalendar } from '@/types/user-detail';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

interface UserActivityHeatmapProps {
    userId: number;
}

export function UserActivityHeatmap({ userId }: UserActivityHeatmapProps) {
    const [activityCalendar, setActivityCalendar] = useState<UserActivityCalendar | null>(null);
    const [activityYears, setActivityYears] = useState<number[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>(
        new Date().getFullYear().toString()
    );

    useEffect(() => {
        const fetchYears = async () => {
            if (!userId) return;
            try {
                const yearsRes = await usersService.getActivityYears(userId);
                setActivityYears(yearsRes);
            } catch (error) {
                console.error('Error fetching activity years:', error);
            }
        };
        fetchYears();
    }, [userId]);

    useEffect(() => {
        const fetchCalendar = async () => {
            if (!userId) return;
            try {
                const year = Number(selectedYear);
                const response = await usersService.getActivityCalendar(userId, year);
                // @ts-ignore
                setActivityCalendar(response);
            } catch (error) {
                console.error('Error fetching activity calendar:', error);
            }
        };

        fetchCalendar();
    }, [userId, selectedYear]);

    const renderHeatmap = () => {
        if (!activityCalendar) return null;

        const { activeDays } = activityCalendar;
        const year = Number(selectedYear);
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        const submissionMap = new Map<string, number>();
        activeDays.forEach((day) => submissionMap.set(day.date, day.count));

        const grid = [];
        const months = [];
        let currentMonth = -1;

        const startDay = startDate.getDay();
        const padding = startDay === 0 ? 6 : startDay - 1;

        for (let i = 0; i < padding; i++) {
            grid.push({ id: `pad-${i}`, isPadding: true, date: '', count: 0 });
        }

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = format(d, 'yyyy-MM-dd');
            const month = d.getMonth();

            if (month !== currentMonth) {
                const totalDays = grid.length;
                const weekIndex = Math.floor(totalDays / 7);
                months.push({ label: format(d, 'MMM'), weekIndex });
                currentMonth = month;
            }

            grid.push({
                id: dateStr,
                isPadding: false,
                date: dateStr,
                count: submissionMap.get(dateStr) || 0,
            });
        }

        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Activity Calendar</h3>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {activityYears.map((y) => (
                                <SelectItem key={y} value={y.toString()}>
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative overflow-x-auto pb-2">
                    {/* Month Labels */}
                    <div className="flex text-xs text-muted-foreground mb-2 relative h-4 ml-10">
                        {months.map((m) => (
                            <div
                                key={m.label}
                                className="absolute"
                                style={{ left: `${m.weekIndex * 16}px` }}
                            >
                                {m.label}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {/* Day Labels */}
                        <div className="flex flex-col gap-1 text-[10px] text-muted-foreground pt-[2px]">
                            <div className="h-3"></div>
                            <div className="h-3">Mon</div>
                            <div className="h-3"></div>
                            <div className="h-3">Wed</div>
                            <div className="h-3"></div>
                            <div className="h-3">Fri</div>
                            <div className="h-3"></div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-rows-7 grid-flow-col gap-1">
                            {grid.map((cell) => (
                                <Tooltip
                                    key={cell.id}
                                    content={
                                        cell.isPadding
                                            ? ''
                                            : `${cell.count} submissions on ${cell.date}`
                                    }
                                >
                                    <div
                                        className={`w-3 h-3 rounded-sm ${cell.isPadding
                                            ? 'bg-transparent'
                                            : cell.count === 0
                                                ? 'bg-muted'
                                                : cell.count < 3
                                                    ? 'bg-green-300'
                                                    : cell.count < 6
                                                        ? 'bg-green-500'
                                                        : 'bg-green-700'
                                            }`}
                                    />
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground">
                    Total active days: {activityCalendar.totalActiveDays}
                </div>
            </div>
        );
    };

    return (
        <Card className="border border-border shadow-md bg-card">
            <CardContent className="pt-6">{renderHeatmap()}</CardContent>
        </Card>
    );
}
