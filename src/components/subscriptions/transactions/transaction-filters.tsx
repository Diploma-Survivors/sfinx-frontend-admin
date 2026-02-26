import { PaymentStatus } from "@/types/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface TransactionFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: PaymentStatus | "ALL";
  setStatusFilter: (value: PaymentStatus | "ALL") => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
}

export function TransactionFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: TransactionFiltersProps) {
  const t = useTranslations("Subscription");

  return (
    <div className="space-y-4 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t("filter.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) =>
              setStatusFilter(val as PaymentStatus | "ALL")
            }
          >
            <SelectTrigger className="w-[180px] h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer">
              <SelectValue placeholder={t("filter.statusLabel")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="cursor-pointer">
                {t("filter.allStatuses")}
              </SelectItem>
              <SelectItem
                value={PaymentStatus.SUCCESS}
                className="cursor-pointer text-green-600 dark:text-green-400"
              >
                {t("status.success")}
              </SelectItem>
              <SelectItem
                value={PaymentStatus.PENDING}
                className="cursor-pointer text-yellow-600 dark:text-yellow-400"
              >
                {t("status.pending")}
              </SelectItem>
              <SelectItem
                value={PaymentStatus.FAILED}
                className="cursor-pointer text-red-600 dark:text-red-400"
              >
                {t("status.failed")}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-auto h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer text-sm"
            />
            <span className="text-slate-400">-</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-auto h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
