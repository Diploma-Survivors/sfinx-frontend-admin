'use client';

import SubmissionDetail from '@/components/submissions/submission-detail';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SubmissionsService } from '@/services/submissions-service';
import { Submission, SubmissionSortBy, SubmissionStatus } from '@/types/submissions';
import { ChevronRight, Clock, History } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import { SortOrder } from '@/types/problems';
import { useTranslations } from 'next-intl';

interface RecentSubmissionsWidgetProps {
    contestId: number;
}

export function RecentSubmissionsWidget({
    contestId,
}: RecentSubmissionsWidgetProps) {
    const t = useTranslations('ContestStatistics.recentSubmissions');
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
    const [submissionDetail, setSubmissionDetail] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const response = await SubmissionsService.getSubmissions({
                    contestId: contestId,
                    limit: 10,
                    sortBy: SubmissionSortBy.SUBMITTED_AT,
                    sortOrder: SortOrder.DESC,
                });
                setSubmissions(response.data.data.data);
            } catch (error) {
                console.error('Failed to fetch recent submissions:', error);
            }
        };
        fetchSubmissions();
    }, [contestId]);

    const handleSubmissionClick = async (submissionId: number) => {
        try {
            const response = await SubmissionsService.getSubmissionById(submissionId);
            setSubmissionDetail(response.data.data);
            setSelectedSubmissionId(submissionId.toString());
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to fetch submission details:', error);
        }
    };

    const getStatusColor = (status: SubmissionStatus) => {
        switch (status) {
            case SubmissionStatus.ACCEPTED:
                return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case SubmissionStatus.WRONG_ANSWER:
                return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case SubmissionStatus.TIME_LIMIT_EXCEEDED:
                return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
        }
    };

    const getStatusLabel = (status: SubmissionStatus) => {
        switch (status) {
            case SubmissionStatus.ACCEPTED:
                return 'AC';
            case SubmissionStatus.WRONG_ANSWER:
                return 'WA';
            case SubmissionStatus.TIME_LIMIT_EXCEEDED:
                return 'TLE';
            case SubmissionStatus.RUNTIME_ERROR:
                return 'RE';
            case SubmissionStatus.COMPILATION_ERROR:
                return 'CE';
            default:
                return 'UNK';
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return t('timeAgo.second', { count: diffInSeconds });

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return t('timeAgo.minute', { count: diffInMinutes });

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return t('timeAgo.hour', { count: diffInHours });

        const diffInDays = Math.floor(diffInHours / 24);
        return t('timeAgo.day', { count: diffInDays });
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col max-h-[600px]">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-500" />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {t('title')}
                        </h2>
                    </div>
                    <Link href={`/submissions?contestId=${contestId}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                            {t('viewAll')}
                            <ChevronRight className="ml-1 w-3 h-3" />
                        </Button>
                    </Link>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-4">
                    {submissions.map((sub) => (
                        <div
                            key={sub.id}
                            onClick={() => handleSubmissionClick(sub.id)}
                            className="group flex flex-col gap-2 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Avatar className="w-6 h-6 border border-slate-200 dark:border-slate-700">
                                        <AvatarImage src={sub.author.avatarUrl || ''} />
                                        <AvatarFallback className="text-[10px]">
                                            {sub.author.username?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {sub.author.username}
                                    </span>
                                    <span className="text-xs font-mono text-slate-400">
                                        • Q{sub.problemId}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    <span>{getTimeAgo(sub.submittedAt)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pl-8">
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] px-1.5 py-0 h-5 ${getStatusColor(
                                        sub.status
                                    )}`}
                                >
                                    {getStatusLabel(sub.status)}
                                </Badge>
                                <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                    {sub.executionTime}ms / {sub.memoryUsed}KB
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Submission Details</DialogTitle>
                    </DialogHeader>
                    {submissionDetail && (
                        <SubmissionDetail
                            submission={submissionDetail}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
