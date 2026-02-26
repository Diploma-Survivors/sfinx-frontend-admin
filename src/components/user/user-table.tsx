"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserProfile } from "@/types/user";
import {
  Ban,
  CheckCircle2,
  Crown,
  Eye,
  MoreHorizontal,
  ShieldAlert,
  UserX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usersService } from "@/services/users-service";
import { toastService } from "@/services/toasts-service";
import { useRouter } from "next/navigation";

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
  const tTable = useTranslations("UsersPage.table");
  const tDialogs = useTranslations("UsersPage.dialogs");
  const tToast = useTranslations("UsersPage.toast");
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionType, setActionType] = useState<"ban" | "unban" | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const currentPage = meta?.page || 1;
  const totalPages = meta?.totalPages || 1;

  const handleAction = (user: UserProfile, action: "ban" | "unban") => {
    setSelectedUser(user);
    setActionType(action);
  };

  const closeDialog = () => {
    setActionType(null);
    setSelectedUser(null);
  };

  const confirmAction = async () => {
    if (!selectedUser || !actionType) return;

    setIsActionLoading(true);
    try {
      if (actionType === "ban") {
        await usersService.banUser(selectedUser.id);
        toastService.success(
          tToast("banSuccess", { username: selectedUser.username }),
        );
      } else if (actionType === "unban") {
        await usersService.unbanUser(selectedUser.id);
        toastService.success(
          tToast("unbanSuccess", { username: selectedUser.username }),
        );
      }

      onRefresh?.();
      closeDialog();
    } catch (error) {
      toastService.error(tToast("actionError"));
    } finally {
      setIsActionLoading(false);
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
                  {tTable("id")}
                </TableHead>
                <TableHead className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  {tTable("user")}
                </TableHead>
                <TableHead className="w-64 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  {tTable("email")}
                </TableHead>
                <TableHead className="w-32 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  {tTable("status")}
                </TableHead>
                <TableHead className="w-32 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  {tTable("plan")}
                </TableHead>
                <TableHead className="w-56 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  {tTable("lastLogin")}
                </TableHead>
                <TableHead className="w-24 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider text-right">
                  {tTable("actions")}
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
                      <Skeleton className="h-6 w-20 rounded-full" />
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
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-slate-500"
                  >
                    {tTable("noUsers")}
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
                          <AvatarImage
                            src={user.avatarUrl}
                            alt={user.username}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {user.fullName}
                          </span>

                          <span className="text-xs text-slate-500">
                            @{user.username}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {user.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          !user.isActive
                            ? "outline"
                            : user.isBanned
                              ? "secondary"
                              : "default"
                        }
                        className={`${
                          !user.isActive
                            ? "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                            : user.isBanned
                              ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 border-0"
                              : "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                        } w-fit`}
                      >
                        {!user.isActive ? (
                          tTable("notVerifiedBadge")
                        ) : user.isBanned ? (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            {tTable("bannedBadge")}
                          </>
                        ) : (
                          tTable("activeBadge")
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isPremium ? (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0 w-fit"
                        >
                          <Crown className="h-3 w-3 mr-1" />
                          {tTable("premiumBadge")}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-0 w-fit"
                        >
                          {tTable("freePlanBadge")}
                        </Badge>
                      )}
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
                          <DropdownMenuLabel>
                            {tTable("actions")}
                          </DropdownMenuLabel>

                          <DropdownMenuItem
                            onClick={() => router.push(`/users/${user.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {tTable("viewDetails")}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {!user.isBanned ? (
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onSelect={() => {
                                setTimeout(() => handleAction(user, "ban"), 0);
                              }}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              {tTable("banUser")}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-primary focus:text-primary"
                              onSelect={() => {
                                setTimeout(
                                  () => handleAction(user, "unban"),
                                  0,
                                );
                              }}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {tTable("unbanUser")}
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
          entityName={tTable("entity")}
        />
      </div>

      <Dialog
        open={!!actionType}
        onOpenChange={(open) => !open && closeDialog()}
      >
        {selectedUser && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert
                  className={`h-5 w-5 ${actionType === "ban" ? "text-red-500" : "text-primary"}`}
                />
                {actionType === "ban"
                  ? tDialogs("banTitle")
                  : tDialogs("unbanTitle")}
              </DialogTitle>
              <DialogDescription>
                {actionType === "ban"
                  ? tDialogs("banDescription")
                  : tDialogs("unbanDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={selectedUser.avatarUrl}
                    alt={selectedUser.username}
                  />
                  <AvatarFallback>
                    {getInitials(selectedUser.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedUser.fullName}</p>
                  <p className="text-sm text-slate-500">
                    @{selectedUser.username}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeDialog}
                disabled={isActionLoading}
              >
                {tDialogs("cancel")}
              </Button>
              <Button
                variant={actionType === "ban" ? "destructive" : "default"}
                onClick={confirmAction}
                disabled={isActionLoading}
              >
                {isActionLoading
                  ? tDialogs("processing")
                  : actionType === "ban"
                    ? tDialogs("banButton")
                    : tDialogs("unbanButton")}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
