'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { UserProfile } from '@/types/user';
import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  Mail,
  MailCheck,
  MoreHorizontal,
  ShieldAlert,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usersService } from '@/services/users-service';
import { toastService } from '@/services/toasts-service';

interface UserTableMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UserTableProps {
  users: UserProfile[];
  meta: UserTableMeta | null;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function UserTable({
  users,
  meta,
  onPageChange,
  isLoading = false,
  onRefresh,
}: UserTableProps) {
  const t = useTranslations('UserTable');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionType, setActionType] = useState<'ban' | 'unban' | 'view' | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const currentPage = meta?.page || 1;
  const totalPages = meta?.totalPages || 1;

  const handleAction = (user: UserProfile, action: 'ban' | 'unban' | 'view') => {
    setSelectedUser(user);
    setActionType(action);
  };

  const closeDialog = () => {
    setActionType(null);
  };

  const confirmAction = async () => {
    if (!selectedUser || !actionType) return;

    setIsActionLoading(true);
    try {
      if (actionType === 'ban') {
        await usersService.banUser(selectedUser.id);
        toastService.success(t('banSuccess', { username: selectedUser.username }));
      } else if (actionType === 'unban') {
        await usersService.unbanUser(selectedUser.id);
        toastService.success(t('unbanSuccess', { username: selectedUser.username }));
      }

      onRefresh?.();
      closeDialog();
    } catch (error) {
      toastService.error(t('actionError'));
    } finally {
      setIsActionLoading(false);
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-700/20 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 border-b border-slate-200 dark:border-slate-700">
                <TableHead className="w-20 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  ID
                </TableHead>
                <TableHead className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  User
                </TableHead>
                <TableHead className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  Email
                </TableHead>
                <TableHead className="w-32 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  Status
                </TableHead>
                <TableHead className="w-32 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  Stats
                </TableHead>
                <TableHead className="w-40 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  Last Login
                </TableHead>
                <TableHead className="w-24 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                    {t('noUsersFound')}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                      #{user.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatarUrl} alt={user.username} />
                          <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {user.fullName}
                            </span>
                            {user.isPremium && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <span className="text-xs text-slate-500">@{user.username}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {user.email}
                        </span>
                        {user.emailVerified ? (
                          <MailCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <Mail className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={user.isActive ? 'default' : 'secondary'}
                          className={`${user.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                            } border-0 w-fit`}
                        >
                          {user.isActive ? (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              Banned
                            </>
                          )}
                        </Badge>
                        {user.isPremium && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0 w-fit"
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-green-600">
                            {user.solvedEasy + user.solvedMedium + user.solvedHard}
                          </span>{' '}
                          solved
                        </span>
                        <span className="text-slate-500">
                          Rank #{user.rank}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {formatDateTime(user.lastLoginAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>

                          <DropdownMenuItem
                            onSelect={() => {
                              // Use setTimeout to allow dropdown to close before opening dialog
                              setTimeout(() => handleAction(user, 'view'), 0);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {user.isActive ? (
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onSelect={() => {
                                // Use setTimeout to allow dropdown to close before opening dialog
                                setTimeout(() => handleAction(user, 'ban'), 0);
                              }}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Ban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-green-600 focus:text-green-600"
                              onSelect={() => {
                                // Use setTimeout to allow dropdown to close before opening dialog
                                setTimeout(() => handleAction(user, 'unban'), 0);
                              }}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Unban User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          meta={meta || undefined}
          entityName="users"
        />
      </div>

      {/* View Details Dialog */}
      {/* View Details Dialog */}
      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={(open) => !open && closeDialog()}>
        {selectedUser && (
          <DialogContent className={actionType === 'view' ? "max-w-2xl max-h-[90vh] overflow-y-auto" : ""}>
            {actionType === 'view' ? (
              <>
                <DialogHeader>
                  <DialogTitle>User Details</DialogTitle>
                  <DialogDescription>
                    Detailed information about {selectedUser.fullName}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Profile Section */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.username} />
                      <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white text-2xl">
                        {getInitials(selectedUser.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{selectedUser.fullName}</h3>
                        {selectedUser.isPremium && <Crown className="h-5 w-5 text-yellow-500" />}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">@{selectedUser.username}</p>
                      <p className="text-sm text-slate-500 mt-2">{selectedUser.bio}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 mb-1">Email</h4>
                      <p className="text-sm">{selectedUser.email}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 mb-1">Phone</h4>
                      <p className="text-sm">{selectedUser.phone}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 mb-1">Address</h4>
                      <p className="text-sm">{selectedUser.address}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 mb-1">GitHub</h4>
                      <p className="text-sm">{selectedUser.githubUsername || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 mb-2">Problem Solving Stats</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                        <p className="text-xs text-slate-500">Rank</p>
                        <p className="text-lg font-bold">#{selectedUser.rank}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <p className="text-xs text-slate-500">Easy</p>
                        <p className="text-lg font-bold text-green-600">{selectedUser.solvedEasy}</p>
                      </div>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                        <p className="text-xs text-slate-500">Medium</p>
                        <p className="text-lg font-bold text-yellow-600">{selectedUser.solvedMedium}</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <p className="text-xs text-slate-500">Hard</p>
                        <p className="text-lg font-bold text-red-600">{selectedUser.solvedHard}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 mb-2">Account Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Account Status</span>
                        <Badge variant={selectedUser.isActive ? 'default' : 'secondary'}>
                          {selectedUser.isActive ? 'Active' : 'Banned'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email Verified</span>
                        <Badge variant={selectedUser.emailVerified ? 'default' : 'secondary'}>
                          {selectedUser.emailVerified ? 'Verified' : 'Not Verified'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Premium Member</span>
                        <Badge variant={selectedUser.isPremium ? 'default' : 'secondary'}>
                          {selectedUser.isPremium ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      {selectedUser.isPremium && (
                        <div className="text-xs text-slate-500 mt-2">
                          Premium expires: {formatDate(selectedUser.premiumExpiresAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Activity */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 mb-2">Activity</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Last Login:</span>
                        <p className="font-medium">{formatDateTime(selectedUser.lastLoginAt)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Last Active:</span>
                        <p className="font-medium">{formatDateTime(selectedUser.lastActiveAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={closeDialog}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ShieldAlert className={`h-5 w-5 ${actionType === 'ban' ? 'text-red-500' : 'text-green-500'}`} />
                    {actionType === 'ban' ? 'Ban User' : 'Unban User'}
                  </DialogTitle>
                  <DialogDescription>
                    {actionType === 'ban'
                      ? 'Are you sure you want to ban this user? They will not be able to access their account.'
                      : 'Are you sure you want to unban this user? They will regain access to their account.'}
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.username} />
                      <AvatarFallback>{getInitials(selectedUser.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{selectedUser.fullName}</p>
                      <p className="text-sm text-slate-500">@{selectedUser.username}</p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={closeDialog} disabled={isActionLoading}>
                    Cancel
                  </Button>
                  <Button
                    variant={actionType === 'ban' ? 'destructive' : 'default'}
                    onClick={confirmAction}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? 'Processing...' : actionType === 'ban' ? 'Ban User' : 'Unban User'}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
