'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function TransactionTableSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-slate-700/20">
                        <TableHead><Skeleton width={80} /></TableHead>
                        <TableHead><Skeleton width={60} /></TableHead>
                        <TableHead><Skeleton width={100} /></TableHead>
                        <TableHead><Skeleton width={80} /></TableHead>
                        <TableHead><Skeleton width={100} /></TableHead>
                        <TableHead><Skeleton width={80} /></TableHead>
                        <TableHead><Skeleton width={120} /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton width={100} /></TableCell>
                            <TableCell>
                                <Skeleton width={120} />
                                <Skeleton width={80} height={10} className="mt-1" />
                            </TableCell>
                            <TableCell><Skeleton width={150} /></TableCell>
                            <TableCell>
                                <Skeleton width={80} />
                                <Skeleton width={60} height={10} className="mt-1" />
                            </TableCell>
                            <TableCell><Skeleton width={100} /></TableCell>
                            <TableCell><Skeleton width={80} height={24} borderRadius={20} /></TableCell>
                            <TableCell>
                                <Skeleton width={100} />
                                <Skeleton width={60} height={10} className="mt-1" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="py-4 border-t border-slate-200 dark:border-slate-700 px-4 flex justify-between items-center">
                <Skeleton width={200} height={20} />
                <div className="flex gap-2">
                    <Skeleton width={32} height={32} />
                    <Skeleton width={32} height={32} />
                </div>
            </div>
        </div>
    );
}
