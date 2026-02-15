"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SystemConfig } from "@/types/system-config";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useTranslations } from "next-intl";

interface SystemConfigTableProps {
  configs: SystemConfig[];
  onEdit: (config: SystemConfig) => void;
  onDelete: (config: SystemConfig) => void;
}

export function SystemConfigTable({
  configs,
  onEdit,
  onDelete,
}: SystemConfigTableProps) {
  const t = useTranslations("SystemConfig.table");

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">{t("key")}</TableHead>
            <TableHead>{t("value")}</TableHead>
            <TableHead className="hidden md:table-cell">
              {t("description")}
            </TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {configs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                {t("noResults")}
              </TableCell>
            </TableRow>
          ) : (
            configs.map((config) => (
              <TableRow key={config.key}>
                <TableCell className="font-mono font-medium">
                  {config.key}
                </TableCell>
                <TableCell
                  className="max-w-[300px] truncate"
                  title={config.value}
                >
                  {config.value}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {config.description}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(config)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t("edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(config)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
