'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserTable from '@/components/user/user-table';
import UserFilter from '@/components/user/user-filter';
import type { UserProfile, UserFilters } from '@/types/user';
import { usersService, SystemUserStatistics } from '@/services/users-service';
import { toastService } from '@/services/toasts-service';

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
      toastService.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, filters]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                  User Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Manage and monitor platform users
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {systemStats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {systemStats.active}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Premium Users
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {systemStats.premium}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Banned Users
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {systemStats.banned}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

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
