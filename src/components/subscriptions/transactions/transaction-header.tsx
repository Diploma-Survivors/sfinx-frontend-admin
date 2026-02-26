import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface TransactionHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export function TransactionHeader({
  onRefresh,
  isLoading,
}: TransactionHeaderProps) {
  const t = useTranslations("Subscription");

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          {t("transactions")}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {t("transactionsDescription")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onRefresh} variant="outline" disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          {t("refresh")}
        </Button>
      </div>
    </div>
  );
}
