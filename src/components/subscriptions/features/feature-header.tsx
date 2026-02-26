import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

interface FeatureHeaderProps {
  onRefresh: () => void;
  onCreate: () => void;
  isLoading: boolean;
}

export function FeatureHeader({
  onRefresh,
  onCreate,
  isLoading,
}: FeatureHeaderProps) {
  const t = useTranslations("Subscription");
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          {t("features.header.title")}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {t("features.header.description")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onRefresh} variant="outline" disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          {t("refresh")}
        </Button>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t("features.header.createFeature")}
        </Button>
      </div>
    </div>
  );
}
