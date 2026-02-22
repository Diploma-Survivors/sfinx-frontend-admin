'use client';

import { useState, useEffect, useCallback } from 'react';
import ReportsTable from '@/components/admin/reports/reports-table';
import { ProblemReport } from '@/types/problem-reports';
import { ProblemReportsService } from '@/services/problem-reports.service';
import { toastService } from '@/services/toasts-service';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
    const [reports, setReports] = useState<ProblemReport[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any | null>(null);

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await ProblemReportsService.getProblemReports({
                page,
                limit: 10,
            });

            setReports(response.data.data);
            setMeta(response.data.meta);
        } catch (error) {
            toastService.error('Failed to fetch reports');
            console.error('Error fetching reports:', error);
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRefresh = () => {
        fetchReports();
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            Problem Reports
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Manage and resolve issues reported by users
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            className="bg-white dark:bg-slate-800"
                            onClick={handleRefresh}
                            disabled={isLoading}
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                            />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Reports Table */}
                <ReportsTable
                    reports={reports}
                    meta={meta}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                    onRefresh={handleRefresh}
                />
            </div>
        </div>
    );
}
