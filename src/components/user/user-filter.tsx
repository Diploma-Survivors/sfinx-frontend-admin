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
  const handleClearFilters = () => {
    onFiltersChange({});
    onSearchChange('');
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    filters.isActive !== undefined || 
    filters.isPremium !== undefined || 
    filters.emailVerified !== undefined;

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <Label htmlFor="search" className="text-sm font-medium mb-2 block">
              Search Users
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="search"
                type="text"
                placeholder="Search by name, username, or email..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Account Status Filter */}
          <div>
            <Label htmlFor="status" className="text-sm font-medium mb-2 block">
              Account Status
            </Label>
            <Select
              value={
                filters.isActive === undefined
                  ? 'all'
                  : filters.isActive
                  ? 'active'
                  : 'banned'
              }
              onValueChange={(value) => {
                if (value === 'all') {
                  const { isActive, ...rest } = filters;
                  onFiltersChange(rest);
                } else {
                  onFiltersChange({
                    ...filters,
                    isActive: value === 'active',
                  });
                }
              }}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Premium Status Filter */}
          <div>
            <Label htmlFor="premium" className="text-sm font-medium mb-2 block">
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
              <SelectTrigger id="premium">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email Verification Filter */}
          <div>
            <Label htmlFor="email-verified" className="text-sm font-medium mb-2 block">
              Email Status
            </Label>
            <Select
              value={
                filters.emailVerified === undefined
                  ? 'all'
                  : filters.emailVerified
                  ? 'verified'
                  : 'unverified'
              }
              onValueChange={(value) => {
                if (value === 'all') {
                  const { emailVerified, ...rest } = filters;
                  onFiltersChange(rest);
                } else {
                  onFiltersChange({
                    ...filters,
                    emailVerified: value === 'verified',
                  });
                }
              }}
            >
              <SelectTrigger id="email-verified">
                <SelectValue placeholder="All Emails" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Emails</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-slate-600 dark:text-slate-400"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
