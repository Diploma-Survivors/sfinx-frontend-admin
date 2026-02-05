import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { UserProblemStats } from '@/types/user-detail';

interface UserSolvedProblemsChartProps {
    stats: UserProblemStats;
}

export function UserSolvedProblemsChart({ stats }: UserSolvedProblemsChartProps) {
    if (!stats) return null;

    return (
        <Card className="border border-border shadow-md bg-card">
            <CardHeader>
                <CardTitle>Solved Problems</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center space-x-8">
                <Tooltip
                    content={((stats.total.solved / (stats.total.total || 1)) * 100).toFixed(1) + '%'}
                >
                    <div className="relative w-32 h-32 flex items-center justify-center cursor-pointer">
                        <svg viewBox="0 0 36 36" className="w-full h-full">
                            <title>Solved Problems Chart</title>
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                className="text-muted"
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3"
                                strokeDasharray={`${(stats.total.solved / (stats.total.total || 1)) *
                                    100
                                    }, 100`}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-bold text-foreground">
                                {stats.total.solved}/{stats.total.total}
                            </span>
                            <span className="text-xs text-muted-foreground">Solved</span>
                        </div>
                    </div>
                </Tooltip>

                <div className="space-y-2 flex-1">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-green-600 font-medium">Easy</span>
                        <span className="font-bold">
                            {stats.easy.solved}
                            <span className="text-muted-foreground font-normal">
                                /{stats.easy.total}
                            </span>
                        </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                                width: `${(stats.easy.solved / (stats.easy.total || 1)) * 100
                                    }%`,
                            }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-yellow-600 font-medium">Medium</span>
                        <span className="font-bold">
                            {stats.medium.solved}
                            <span className="text-muted-foreground font-normal">
                                /{stats.medium.total}
                            </span>
                        </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                        <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{
                                width: `${(stats.medium.solved /
                                    (stats.medium.total || 1)) *
                                    100
                                    }%`,
                            }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-red-600 font-medium">Hard</span>
                        <span className="font-bold">
                            {stats.hard.solved}
                            <span className="text-muted-foreground font-normal">
                                /{stats.hard.total}
                            </span>
                        </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                        <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                                width: `${(stats.hard.solved / (stats.hard.total || 1)) * 100
                                    }%`,
                            }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
