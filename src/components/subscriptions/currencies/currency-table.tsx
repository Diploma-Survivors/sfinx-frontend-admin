import { CurrencyConfig } from "@/types/currency";
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

interface CurrencyTableProps {
  currencies: CurrencyConfig[];
  isLoading: boolean;
  onEdit: (currency: CurrencyConfig) => void;
  onDelete: (id: number, name: string) => void;
}

export function CurrencyTable({
  currencies,
  isLoading,
  onEdit,
  onDelete,
}: CurrencyTableProps) {
  const t = useTranslations("Subscription.currencies.table");
  const locale = useLocale();

  const getLocalizedName = (currency: CurrencyConfig): string => {
    const localized = currency.translations?.find(
      (item) => item.languageCode === locale,
    );
    const fallback = currency.translations?.find(
      (item) => item.languageCode === "en",
    );
    return localized?.name || fallback?.name || currency.name;
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
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("symbol")}</TableHead>
              <TableHead>{t("rateToVnd")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currencies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-slate-500"
                >
                  {t("noCurrencies")}
                </TableCell>
              </TableRow>
            ) : (
              currencies.map((currency) => (
                <TableRow key={currency.id}>
                  <TableCell className="font-mono font-medium">
                    {currency.code}
                  </TableCell>
                  <TableCell>{getLocalizedName(currency)}</TableCell>
                  <TableCell className="text-lg">{currency.symbol}</TableCell>
                  <TableCell className="font-mono">
                    {Number(currency.rateToVnd).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={currency.isActive ? "default" : "secondary"}>
                      {currency.isActive ? t("active") : t("inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(currency)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(currency.id, currency.name)}
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
