"use client";

import { useState, useEffect } from "react";
import { paymentService } from "@/services/payment-service";
import { PaymentTransaction, PaymentStatus } from "@/types/payment";
import { toastService } from "@/services/toasts-service";
import { TransactionHeader } from "@/components/subscriptions/transactions/transaction-header";
import { TransactionFilters } from "@/components/subscriptions/transactions/transaction-filters";
import { TransactionTable } from "@/components/subscriptions/transactions/transaction-table";
import { useTranslations } from "next-intl";

export default function TransactionsPage() {
  const t = useTranslations("Subscription");
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">(
    "ALL",
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [meta, setMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  } | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== debouncedSearch && page !== 1) {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  // Master fetch effect
  useEffect(() => {
    fetchTransactions();
  }, [page, debouncedSearch, statusFilter, startDate, endDate]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await paymentService.getTransactions({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setTransactions(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      toastService.error(t("messages.loadTransactionsError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TransactionHeader onRefresh={fetchTransactions} isLoading={isLoading} />

      <TransactionFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        startDate={startDate}
        setStartDate={(val) => {
          setStartDate(val);
          setPage(1);
        }}
        endDate={endDate}
        setEndDate={(val) => {
          setEndDate(val);
          setPage(1);
        }}
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
