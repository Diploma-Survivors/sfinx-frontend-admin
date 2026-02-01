'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PaymentTransaction, subscriptionService, PaymentStatus } from '@/services/subscription-service';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search } from 'lucide-react';
import { toastService } from '@/services/toasts-service';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

export default function TransactionsPage() {
    const t = useTranslations('Subscription');
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [meta, setMeta] = useState<{
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage?: boolean;
        hasPreviousPage?: boolean;
    } | null>(null);

    useEffect(() => {
        fetchTransactions();
    }, [page, statusFilter]);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const response = await subscriptionService.getTransactions({
                page,
                limit: 10,
                status: statusFilter === 'ALL' ? undefined : statusFilter,
                search: search || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });
            setTransactions(response.data.data);
            setMeta(response.data.meta);
        } catch (error) {
            toastService.error('Failed to load transactions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchTransactions();
    };

    const getStatusBadgeVariant = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.SUCCESS: return 'default';
            case PaymentStatus.PENDING: return 'secondary';
            case PaymentStatus.FAILED: return 'destructive';
            default: return 'outline';
        }
    };

    const getStatusColorClass = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.SUCCESS: return 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400';
            case PaymentStatus.PENDING: return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
            case PaymentStatus.FAILED: return 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400';
            default: return '';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t('transactions')}</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{t('transactionsDescription')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => fetchTransactions()} variant="outline" disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by username or transaction ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val as PaymentStatus | 'ALL'); setPage(1); }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value={PaymentStatus.SUCCESS}>{t('status.success')}</SelectItem>
                                <SelectItem value={PaymentStatus.PENDING}>{t('status.pending')}</SelectItem>
                                <SelectItem value={PaymentStatus.FAILED}>{t('status.failed')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Date</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">End Date</label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full md:w-auto">Apply Filters</Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setSearch('');
                                setStatusFilter('ALL');
                                setStartDate('');
                                setEndDate('');
                                setPage(1);
                                // Need to trigger fetch manually or rely on useEffect dependecies changes (but search/dates are not in dependency array)
                                // Better to just reset state and let user click Apply or rely on separate reset effect if needed.
                                // For now, let's just reset values.
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50 dark:bg-slate-700/20">
                            <TableHead>{t('table.txnId')}</TableHead>
                            <TableHead>{t('table.user')}</TableHead>
                            <TableHead>{t('table.name')}</TableHead>
                            <TableHead>{t('table.amount')}</TableHead>
                            <TableHead>{t('table.provider')}</TableHead>
                            <TableHead>{t('table.status')}</TableHead>
                            <TableHead>{t('table.date')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && transactions.length === 0 ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={7} className="h-16 text-center text-slate-500">Loading...</TableCell>
                                </TableRow>
                            ))
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                                    No transactions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((txn) => (
                                <TableRow key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <TableCell className="font-mono text-xs">{txn.transactionId}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-800 dark:text-slate-200">{txn.username}</span>
                                            <span className="text-xs text-slate-500">ID: {txn.userId}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{txn.planName}</TableCell>
                                    <TableCell className="font-medium">
                                        ${txn.amount.toFixed(2)}
                                        <div className="text-xs text-slate-500">{txn.amountVnd.toLocaleString('vi-VN')} VND</div>
                                    </TableCell>
                                    <TableCell>{txn.provider}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(txn.status)} className={getStatusColorClass(txn.status)}>
                                            {t(`status.${txn.status.toLowerCase()}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                                        {new Date(txn.createdAt).toLocaleDateString()}
                                        <div className="text-xs">{new Date(txn.createdAt).toLocaleTimeString()}</div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {meta && (
                    <div className="py-4 border-t border-slate-200 dark:border-slate-700">
                        <DataTablePagination
                            currentPage={meta.page}
                            totalPages={meta.totalPages}
                            onPageChange={setPage}
                            meta={meta}
                            entityName="transactions"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
