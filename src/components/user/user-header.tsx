import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface UserHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export function UserHeader({ onRefresh, isLoading }: UserHeaderProps) {
  const t = useTranslations("UsersPage.header");

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {t("title")}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {t("description")}
            </p>
          </div>
        </div>
        <Button
          onClick={onRefresh}
          variant="outline"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("refresh")}
        </Button>
      </div>
    </div>
  );
}
