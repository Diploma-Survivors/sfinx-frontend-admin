import { Button } from "@/components/ui/button";
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
import { Edit, Trash2 } from "lucide-react";
import { FeatureTableSkeleton } from "./feature-table-skeleton";
import { useTranslations } from "next-intl";

interface FeatureTableProps {
  features: any[];
  isLoading: boolean;
  onEdit: (feature: any) => void;
  onDelete: (id: number, name: string) => void;
}

export function FeatureTable({
  features,
  isLoading,
  onEdit,
  onDelete,
}: FeatureTableProps) {
  const t = useTranslations("Subscription.features.table");

  if (isLoading) {
    return <FeatureTableSkeleton />;
  }

  const getFeatureName = (feature: any) => {
    const enTranslation = feature.translations?.find(
      (t: any) => t.languageCode === "en",
    );
    return enTranslation?.name || feature.key;
  };

  const getFeatureDescription = (feature: any) => {
    const enTranslation = feature.translations?.find(
      (t: any) => t.languageCode === "en",
    );
    return enTranslation?.description || "";
  };

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
              <TableHead>{t("key")}</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("descLabel")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-slate-500"
                >
                  {t("noFeatures")}
                </TableCell>
              </TableRow>
            ) : (
              features.map((feature) => (
                <TableRow key={feature.id}>
                  <TableCell className="font-mono text-sm">
                    {feature.key}
                  </TableCell>
                  <TableCell className="font-medium">
                    {getFeatureName(feature)}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 max-w-md truncate">
                    {getFeatureDescription(feature)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={feature.isActive ? "default" : "secondary"}>
                      {feature.isActive ? t("active") : t("inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(feature)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() =>
                          onDelete(feature.id, getFeatureName(feature))
                        }
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
