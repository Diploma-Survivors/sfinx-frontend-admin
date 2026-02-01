'use client';

import { useState, useEffect } from 'react';
import { paymentService } from '@/services/payment-service';
import { PaymentTransaction, PaymentStatus } from '@/types/payment';
import { toastService } from '@/services/toasts-service';
import { TransactionHeader } from '@/components/subscriptions/transactions/transaction-header';
import { TransactionFilters } from '@/components/subscriptions/transactions/transaction-filters';
import { TransactionTable } from '@/components/subscriptions/transactions/transaction-table';

export default function TransactionsPage() {
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


    // Debounce search term
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPage(1); // Reset to page 1 on search change
            fetchTransactions();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search]);

    // Auto-fetch on filter changes
    useEffect(() => {
        setPage(1); // Reset to page 1 on filter change
        fetchTransactions();
    }, [statusFilter, startDate, endDate]);

    // Fetch on page change
    useEffect(() => {
        fetchTransactions();
    }, [page]);

    // Initial fetch
    useEffect(() => {
        fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const response = await paymentService.getTransactions({
                page,
                limit: 10,
                search: search || undefined,
                status: statusFilter === 'ALL' ? undefined : statusFilter,
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

    return (
        <div className="container mx-auto px-4 py-8">
            <TransactionHeader
                onRefresh={fetchTransactions}
                isLoading={isLoading}
            />

            <TransactionFilters
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={(val) => {
                    setStatusFilter(val);
                    setPage(1);
                }}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
            />

            <TransactionTable
                transactions={transactions}
                isLoading={isLoading}
                meta={meta}
                onPageChange={setPage}
            />
        </div>
    );
}
