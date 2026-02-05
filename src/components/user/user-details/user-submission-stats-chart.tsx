import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { SubmissionStatus, UserSubmissionStats } from '@/types/user-detail';

interface UserSubmissionStatsChartProps {
    stats: UserSubmissionStats;
}

export function UserSubmissionStatsChart({ stats }: UserSubmissionStatsChartProps) {
    if (!stats) return null;

    return (
        <Card className="border border-border shadow-md bg-card">
            <CardHeader>
                <CardTitle>Submission Stats</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
                {/* Pie Chart */}
                <div className="relative w-32 h-32">
                    <svg
                        viewBox="0 0 32 32"
                        className="w-full h-full transform -rotate-90"
                    >
                        <title>Submission Status Chart</title>
                        {(() => {
                            const total = stats.total || 1;
                            let cumulativePercent = 0;
                            const data = [
                                {
                                    status: SubmissionStatus.ACCEPTED,
                                    count: stats.accepted,
                                    color: '#10b981',
                                },
                                {
                                    status: SubmissionStatus.WRONG_ANSWER,
                                    count: stats.wrongAnswer,
                                    color: '#ef4444',
                                },
                                {
                                    status: SubmissionStatus.TIME_LIMIT_EXCEEDED,
                                    count: stats.timeLimitExceeded,
                                    color: '#eab308',
                                },
                                {
                                    status: SubmissionStatus.RUNTIME_ERROR,
                                    count: stats.runtimeError,
                                    color: '#f97316',
                                },
                                {
                                    status: 'others',
                                    count:
                                        stats.others +
                                        stats.compilationError,
                                    color: '#6b7280',
                                },
                            ];

                            return (
                                <>
                                    {data.map((item) => {
                                        if (item.count === 0) return null;

                                        const percent = (item.count / total) * 100;
                                        const startPercent = cumulativePercent;
                                        cumulativePercent += percent;

                                        const x1 =
                                            16 + 16 * Math.cos((2 * Math.PI * startPercent) / 100);
                                        const y1 =
                                            16 + 16 * Math.sin((2 * Math.PI * startPercent) / 100);
                                        const x2 =
                                            16 +
                                            16 * Math.cos((2 * Math.PI * cumulativePercent) / 100);
                                        const y2 =
                                            16 +
                                            16 * Math.sin((2 * Math.PI * cumulativePercent) / 100);

                                        const largeArcFlag = percent > 50 ? 1 : 0;

                                        if (percent > 99.9) {
                                            return (
                                                <circle
                                                    key={item.status}
                                                    cx="16"
                                                    cy="16"
                                                    r="16"
                                                    fill={item.color}
                                                />
                                            );
                                        }

                                        return (
                                            <Tooltip
                                                key={item.status}
                                                content={`${item.status === 'others' ? 'Others' : item.status
                                                    }: ${percent.toFixed(1)}%`}
                                            >
                                                <path
                                                    d={`M 16 16 L ${x1} ${y1} A 16 16 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                                    fill={item.color}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                />
                                            </Tooltip>
                                        );
                                    })}
                                </>
                            );
                        })()}
                    </svg>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Accepted:</span>
                        <span className="font-bold">{stats.accepted}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-muted-foreground">Wrong Answer:</span>
                        <span className="font-bold">
                            {stats.wrongAnswer}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-muted-foreground">Time Limit:</span>
                        <span className="font-bold">
                            {stats.timeLimitExceeded}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-muted-foreground">Runtime Error:</span>
                        <span className="font-bold">
                            {stats.runtimeError}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500" />
                        <span className="text-muted-foreground">Others:</span>
                        <span className="font-bold">
                            {stats.others +
                                stats.compilationError}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
