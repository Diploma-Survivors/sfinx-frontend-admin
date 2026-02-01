import { PaymentTransaction, PaymentStatus } from '@/types/payment';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { useTranslations } from 'next-intl';

interface TransactionTableProps {
    transactions: PaymentTransaction[];
    isLoading: boolean;
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage?: boolean;
        hasPreviousPage?: boolean;
    } | null;
    onPageChange: (page: number) => void;
}

export function TransactionTable({ transactions, isLoading, meta, onPageChange }: TransactionTableProps) {
    const t = useTranslations('Subscription');

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
                        onPageChange={onPageChange}
                        meta={meta}
                        entityName="transactions"
                    />
                </div>
            )}
        </div>
    );
}
