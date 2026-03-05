"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Permission } from "@/types/permission";
import { getAllPermissions } from "@/services/permission-service";
import { Search } from "lucide-react";
import { format } from "date-fns";

export default function PermissionsTab() {
  const t = useTranslations("PermissionsTab");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");

  useEffect(() => {
    const fetchPermissions = async () => {
      setIsLoading(true);
      try {
        const data = await getAllPermissions();
        setPermissions(data);
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  // Extract unique resources and actions for filters
  const resources = Array.from(
    new Set(permissions.map((p) => p.resource)),
  ).sort();
  const actions = Array.from(new Set(permissions.map((p) => p.action))).sort();

  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch =
      permission.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesResource =
      resourceFilter === "all" || permission.resource === resourceFilter;
    const matchesAction =
      actionFilter === "all" || permission.action === actionFilter;

    return matchesSearch && matchesResource && matchesAction;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "read":
      case "read_all":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "update":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "delete":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 bg-white">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("filterByResource")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allResources")}</SelectItem>
            {resources.map((resource) => (
              <SelectItem key={resource} value={resource}>
                {resource}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("filterByAction")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allActions")}</SelectItem>
            {actions.map((action) => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">{t("id")}</TableHead>
              <TableHead>{t("resource")}</TableHead>
              <TableHead>{t("action")}</TableHead>
              <TableHead>{t("description")}</TableHead>
              <TableHead className="text-right">{t("lastUpdated")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t("loading")}
                </TableCell>
              </TableRow>
            ) : filteredPermissions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-slate-500"
                >
                  {t("noResults")}
                </TableCell>
              </TableRow>
            ) : (
              filteredPermissions.map((permission) => (
                <TableRow
                  key={permission.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <TableCell className="font-mono text-xs text-slate-500">
                    {permission.id}
                  </TableCell>
                  <TableCell className="font-bold text-slate-800 dark:text-slate-200">
                    {permission.resource}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`${getActionColor(permission.action)} border-0`}
                    >
                      {permission.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {permission.description}
                  </TableCell>
                  <TableCell className="text-right text-xs text-slate-500">
                    {format(new Date(permission.updatedAt), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
