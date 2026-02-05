import { Users } from 'lucide-react';
import type { SystemUserStatistics } from '@/services/users-service';

interface UserStatsProps {
    stats: SystemUserStatistics;
}

export function UserStats({ stats }: UserStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Total Users
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                            {stats.total}
                        </p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Active Users
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                            {stats.active}
                        </p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Premium Users
                        </p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                            {stats.premium}
                        </p>
                    </div>
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Banned Users
                        </p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                            {stats.banned}
                        </p>
                    </div>
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}
