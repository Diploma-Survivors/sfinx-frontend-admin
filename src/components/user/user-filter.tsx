'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserFilters } from '@/types/user';

import React, { useState, useEffect } from 'react';

interface UserFilterProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function UserFilter({
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
}: UserFilterProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync local state when prop changes (e.g. from clear filters or initial load)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchQuery]);

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <Label htmlFor="search" className="text-sm font-medium mb-1 block">
              Search Users
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="search"
                type="text"
                placeholder="Search by name, username, or email..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          {/* Account Status Filter */}
          <div>
            <Label htmlFor="status" className="text-sm font-medium mb-1 block">
              Account Status
            </Label>
            <Select
              value={
                filters.status === undefined
                  ? 'all'
                  : filters.status
              }
              onValueChange={(value) => {
                if (value === 'all') {
                  const { status, ...rest } = filters;
                  onFiltersChange(rest);
                } else {
                  onFiltersChange({
                    ...filters,
                    status: value as 'active' | 'banned' | 'not_verified',
                    isActive: undefined, // Clear legacy isActive filter if present
                  });
                }
              }}
            >
              <SelectTrigger id="status" className="h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="not_verified">Not Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Premium Status Filter */}
          <div>
            <Label htmlFor="premium" className="text-sm font-medium mb-1 block">
              Premium Status
            </Label>
            <Select
              value={
                filters.isPremium === undefined
                  ? 'all'
                  : filters.isPremium
                    ? 'premium'
                    : 'free'
              }
              onValueChange={(value) => {
                if (value === 'all') {
                  const { isPremium, ...rest } = filters;
                  onFiltersChange(rest);
                } else {
                  onFiltersChange({
                    ...filters,
                    isPremium: value === 'premium',
                  });
                }
              }}
            >
              <SelectTrigger id="premium" className="h-9">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>


        </div>
      </CardContent>
    </Card>
  );
}
