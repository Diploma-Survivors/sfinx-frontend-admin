import { FeeConfig } from "@/types/fee-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface FeeConfigTableProps {
  fees: FeeConfig[];
  isLoading: boolean;
  onEdit: (fee: FeeConfig) => void;
  onDelete: (id: number, code: string) => void;
}

export function FeeConfigTable({
  fees,
  isLoading,
  onEdit,
  onDelete,
}: FeeConfigTableProps) {
  const t = useTranslations("Subscription.feeConfigs.table");
  const locale = useLocale();

  const getLocalizedDescription = (fee: FeeConfig): string | null => {
    const localized = fee.translations?.find(
      (item) => item.languageCode === locale,
    );
    const fallback = fee.translations?.find((item) => item.languageCode === "en");
    return localized?.description || fallback?.description || null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("code")}</TableHead>
              <TableHead>{t("descLabel")}</TableHead>
              <TableHead>{t("value")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-slate-500"
                >
                  {t("noFees")}
                </TableCell>
              </TableRow>
            ) : (
              fees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-mono font-medium">{fee.code}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 max-w-md truncate">
                    {getLocalizedDescription(fee) || "—"}
                  </TableCell>
                  <TableCell className="font-mono">
                    {(Number(fee.value) * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    <Badge variant={fee.isActive ? "default" : "secondary"}>
                      {fee.isActive ? t("active") : t("inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(fee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(fee.id, fee.code)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
