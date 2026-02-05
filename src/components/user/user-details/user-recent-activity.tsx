import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usersService } from '@/services/users-service';
import { UserRecentACProblem } from '@/types/user-detail';
import { format } from 'date-fns';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserRecentActivityProps {
    userId: number;
}

export function UserRecentActivity({ userId }: UserRecentActivityProps) {
    const [recentActivity, setRecentActivity] = useState<UserRecentACProblem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentActivity = async () => {
            if (!userId) return;
            try {
                const recentRes = await usersService.getRecentAcProblems(userId);
                // @ts-ignore
                setRecentActivity(recentRes);
            } catch (error) {
                console.error('Error fetching recent activity:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentActivity();
    }, [userId]);

    if (loading) {
        return (
            <Card className="border border-border shadow-md bg-card h-full">
                <CardHeader>
                    <CardTitle>Recent AC Problems</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-border shadow-md bg-card">
            <CardHeader>
                <CardTitle>Recent AC Problems</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentActivity.map((activity) => (
                        <div
                            key={new Date(activity.firstSolvedAt).getTime()}
                            className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-full bg-green-100 text-green-600">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-foreground">
                                        {activity.problem.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>
                                            {format(
                                                new Date(activity.firstSolvedAt),
                                                'MMM d, yyyy'
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                    ))}
                    {recentActivity.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            No recent activity
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
