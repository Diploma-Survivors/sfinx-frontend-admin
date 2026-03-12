"use client";

import { TransactionFilters } from "@/components/subscriptions/transactions/transaction-filters";
import { TransactionHeader } from "@/components/subscriptions/transactions/transaction-header";
import { TransactionTable } from "@/components/subscriptions/transactions/transaction-table";
import { paymentService } from "@/services/payment-service";
import { toastService } from "@/services/toasts-service";
import { PaymentStatus, PaymentTransaction } from "@/types/payment";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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

  // Scroll to and highlight a transaction targeted by URL hash (e.g. #transaction-123)
  useEffect(() => {
    if (!isLoading && transactions.length > 0 && typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.startsWith("#transaction-")) {
        const id = hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.classList.add("is-highlighted");
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 300);

          setTimeout(() => {
            element.classList.remove("is-highlighted");
          }, 5000);
        }
      }
    }
  }, [isLoading, transactions]);

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
