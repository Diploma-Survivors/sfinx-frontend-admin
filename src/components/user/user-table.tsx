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
  UserCog,
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
import { format } from "date-fns";
import { RolesService } from "@/services/roles-service";
import type { Role } from "@/types/role";

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
  const [actionType, setActionType] = useState<"ban" | "unban" | "edit-role" | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isFetchingRole, setIsFetchingRole] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const currentPage = meta?.page || 1;
  const totalPages = meta?.totalPages || 1;

  const handleAction = async (user: UserProfile, action: "ban" | "unban" | "edit-role") => {
    setSelectedUser(user);
    setActionType(action);
    if (action === "edit-role") {
      setIsFetchingRole(true);
      try {
        const [fetchedRoles, userRoleRes] = await Promise.all([
          roles.length === 0 ? RolesService.getAllRoles() : Promise.resolve(roles),
          usersService.getUserRole(user.id).catch(() => null)
        ]);

        if (roles.length === 0) {
          setRoles(fetchedRoles as Role[]);
        }

        if (userRoleRes && userRoleRes.data) {
          setSelectedRoleId(userRoleRes.data.id);
          // Optional: update the user object in state if we want to show it immediately
          setSelectedUser({ ...user, role: userRoleRes.data });
        } else {
          setSelectedRoleId(user.role?.id ?? null);
        }
      } catch (error) {
        toastService.error(tToast("fetchError"));
      } finally {
        setIsFetchingRole(false);
      }
    }
  };

  const closeDialog = () => {
    setActionType(null);
    setSelectedUser(null);
    setSelectedRoleId(null);
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
      } else if (actionType === "edit-role") {
        if (!selectedRoleId) return;
        await usersService.updateUserRole(selectedUser.id, selectedRoleId);
        toastService.success(tToast("editRoleSuccess"));
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
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
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

                          <DropdownMenuItem
                            onSelect={() => {
                              setTimeout(() => handleAction(user, "edit-role"), 0);
                            }}
                          >
                            <UserCog className="mr-2 h-4 w-4" />
                            {tTable("editRole")}
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
                {actionType === "edit-role" ? (
                  <>
                    <UserCog className="h-5 w-5 text-primary" />
                    {tDialogs("editRoleTitle")}
                  </>
                ) : (
                  <>
                    <ShieldAlert
                      className={`h-5 w-5 ${actionType === "ban" ? "text-red-500" : "text-primary"}`}
                    />
                    {actionType === "ban"
                      ? tDialogs("banTitle")
                      : tDialogs("unbanTitle")}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {actionType === "edit-role"
                  ? ""
                  : actionType === "ban"
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
                  {actionType === "edit-role" && selectedUser.role && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-slate-500">{tDialogs("currentRole")}:</span>
                      <Badge variant="outline" className="bg-primary/5 text-primary">
                        {selectedUser.role.name}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {actionType === "edit-role" && (
                <div className="mt-6 flex flex-col space-y-3">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {tDialogs("selectRole")}
                  </h4>
                  {isFetchingRole ? (
                    <div className="flex flex-col gap-3 rounded-md border border-slate-200 dark:border-slate-700 p-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Skeleton className="h-4 w-4 rounded-full mt-0.5" />
                          <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 rounded-md border border-slate-200 dark:border-slate-700 p-4">
                      {roles.map((role) => (
                        <label 
                          key={role.id} 
                          className="flex items-start gap-3 cursor-pointer group"
                        >
                        <div className="flex h-5 items-center">
                          <input
                            type="radio"
                            name="role"
                            value={role.id}
                            checked={selectedRoleId === role.id}
                            onChange={() => setSelectedRoleId(role.id)}
                            className="h-4 w-4 mt-0.5 border-slate-300 text-primary focus:ring-primary dark:border-slate-600 cursor-pointer"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100 transition-colors group-hover:text-primary">
                            {role.name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {role.description}
                          </span>
                        </div>
                      </label>
                    ))}
                    {roles.length === 0 && (
                      <div className="text-sm text-slate-500">
                        {tTable("noData")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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
                  variant={
                    actionType === "ban"
                      ? "destructive"
                      : "default"
                  }
                  onClick={confirmAction}
                  disabled={isActionLoading || isFetchingRole || (actionType === "edit-role" && !selectedRoleId)}
                >
                  {isActionLoading
                    ? tDialogs("processing")
                    : actionType === "edit-role"
                      ? tDialogs("saveRole")
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
