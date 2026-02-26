"use client";

import { useState, useEffect, useCallback } from "react";
import UserTable from "@/components/user/user-table";
import UserFilter from "@/components/user/user-filter";
import { UserStats } from "@/components/user/user-stats";
import { UserHeader } from "@/components/user/user-header";
import type { UserProfile, UserFilters } from "@/types/user";
import { usersService, SystemUserStatistics } from "@/services/users-service";
import { toastService } from "@/services/toasts-service";
import { useTranslations } from "next-intl";

export default function UsersPage() {
  const t = useTranslations("UsersPage.toast");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<UserFilters>({});
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null>(null);

  const [systemStats, setSystemStats] = useState<SystemUserStatistics>({
    total: 0,
    active: 0,
    premium: 0,
    banned: 0,
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersResponse, stats] = await Promise.all([
        usersService.getAllUsers({
          page,
          limit: 10,
          search: searchQuery,
          ...filters,
        }),
        usersService.getSystemStatistics(),
      ]);

      setUsers(usersResponse.data.data);
      setMeta(usersResponse.data.meta);
      setSystemStats(stats);
    } catch (error) {
      toastService.error(t("fetchError"));
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, filters, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page on search
  };

  const handleFiltersChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <UserHeader onRefresh={handleRefresh} isLoading={isLoading} />

        <UserStats stats={systemStats} />

        {/* Filters */}
        <div className="mb-6">
          <UserFilter
            filters={filters}
            onFiltersChange={handleFiltersChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
          />
        </div>

        {/* Users Table */}
        <UserTable
          users={users}
          meta={meta}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}
