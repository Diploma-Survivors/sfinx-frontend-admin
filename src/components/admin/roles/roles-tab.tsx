'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Role } from '@/types/role';
import { RolesService } from '@/services/roles-service';
import { Plus, Search, Edit, Trash2, Lock, Shield, View, Eye } from 'lucide-react';
import RoleFormDialog from './role-form-dialog';
import EditRoleDrawer from './edit-role-drawer';
import { useApp } from '@/contexts/app-context';
import { PermissionEnum } from '@/types/permission';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowDown, ArrowUp, ChevronDown, RotateCcw } from 'lucide-react';

enum RoleSortBy {
    ID = 'id',
    PRIORITY = 'priority',
    PERMISSIONS_COUNT = 'permissions_count',
}

enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export default function RolesTab({ refreshKey }: { refreshKey?: number }) {
    const t = useTranslations('RolesTab');
    const { hasPermission } = useApp();
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [typeFilter, setTypeFilter] = useState<'all' | 'system' | 'custom'>('all');
    const [sortBy, setSortBy] = useState<RoleSortBy>(RoleSortBy.ID);
    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const data = await RolesService.getAllRoles();
            setRoles(data);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, [refreshKey]);

    const handleEditClick = (role: Role) => {
        setSelectedRole(role);
        setIsEditDrawerOpen(true);
    };

    const handleUpdateSuccess = () => {
        fetchRoles();
        // Keep drawer open or close it? Usually keep open or close depending on UX.
        // Let's close it for now or refresh data.
        if (selectedRole) {
            // Refresh selected role data if needed, but fetchRoles updates the list.
            // We might need to re-fetch the specific role to update the drawer if it stays open.
            // For now, let's just refresh the list.
        }
    };

    const handleDeleteClick = async (role: Role) => {
        if (confirm(t('confirmDelete', { name: role.name }))) {
            try {
                await RolesService.deleteRole(role.id);
                fetchRoles();
            } catch (error) {
                console.error('Failed to delete role:', error);
                alert(t('deleteFailed'));
            }
        }
    };

    const filteredRoles = roles
        .filter((role) =>
            role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            role.slug.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter((role) => {
            if (typeFilter === 'all') return true;
            if (typeFilter === 'system') return role.isSystemRole;
            if (typeFilter === 'custom') return !role.isSystemRole;
            return true;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case RoleSortBy.ID:
                    comparison = a.id - b.id;
                    break;
                case RoleSortBy.PRIORITY:
                    comparison = a.priority - b.priority;
                    break;
                case RoleSortBy.PERMISSIONS_COUNT:
                    comparison = (a.permissions?.length || 0) - (b.permissions?.length || 0);
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === SortOrder.ASC ? comparison : -comparison;
        });

    const handleReset = () => {
        setSearchQuery('');
        setTypeFilter('all');
        setSortBy(RoleSortBy.ID);
        setSortOrder(SortOrder.ASC);
    };

    return (
        <div className="space-y-6">
            {/* Filters & Search Container */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center md:flex-row justify-between gap-4">
                
                {/* Left side: Search and Type Filter */}
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>
                        {/* Type Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer whitespace-nowrap"
                                >
                                    {t('typeFilter')}
                                    {typeFilter !== 'all' && (
                                        <Badge variant="secondary" className="ml-2 h-5 px-1.5 capitalize">
                                            {typeFilter}
                                        </Badge>
                                    )}
                                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuLabel>{t('selectType')}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {[
                                    { value: 'all', label: t('all') },
                                    { value: 'system', label: t('system') },
                                    { value: 'custom', label: t('custom') },
                                ].map((option) => {
                                    const isChecked = typeFilter === option.value;
                                    return (
                                        <div
                                            key={option.value}
                                            className="flex items-center px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setTypeFilter(option.value as 'all' | 'system' | 'custom');
                                            }}
                                        >
                                            <div className={`flex items-center justify-center w-4 h-4 mr-2 border rounded-full ${isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-slate-300'}`}>
                                                {isChecked && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <span className="text-sm">{option.label}</span>
                                        </div>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {(searchQuery || typeFilter !== 'all' || sortBy !== RoleSortBy.ID || sortOrder !== SortOrder.ASC) && (
                            <Button
                                variant="ghost"
                                onClick={handleReset}
                                className="h-10 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                                title={t('reset')}
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        )}
                </div>

                {/* Right side: Sort */}
                <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-slate-500 whitespace-nowrap">{t('sortByLabel')}</div>
                        <Select
                            value={sortBy}
                            onValueChange={(value) => setSortBy(value as RoleSortBy)}
                        >
                            <SelectTrigger className="w-[180px] h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={RoleSortBy.ID} className="cursor-pointer">{t('id')}</SelectItem>
                                <SelectItem value={RoleSortBy.PRIORITY} className="cursor-pointer">{t('priority')}</SelectItem>
                                <SelectItem value={RoleSortBy.PERMISSIONS_COUNT} className="cursor-pointer">{t('permissionsCountSort')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                setSortOrder(
                                    sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
                                )
                            }
                            className="h-10 w-10 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
                        >
                            {sortOrder === SortOrder.ASC ? (
                                <ArrowDown className="h-4 w-4" />
                            ) : (
                                <ArrowUp className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Roles Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">{t('id')}</TableHead>
                            <TableHead>{t('roleName')}</TableHead>
                            <TableHead>{t('priority')}</TableHead>
                            <TableHead>{t('type')}</TableHead>
                            <TableHead>{t('permissions')}</TableHead>
                            <TableHead className="text-right">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    {t('loading')}
                                </TableCell>
                            </TableRow>
                        ) : filteredRoles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    {t('noResults')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRoles.map((role) => (
                                <TableRow key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <TableCell className="font-mono text-xs text-slate-500">
                                        {role.id}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900 dark:text-slate-100">
                                                {role.name}
                                            </span>
                                            <span className="text-xs text-slate-500 font-mono">
                                                {role.slug}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono">
                                            {role.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {role.isSystemRole ? (
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 gap-1">
                                                <Lock className="h-3 w-3" />
                                                {t('system')}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="gap-1 text-slate-500">
                                                <Shield className="h-3 w-3" />
                                                {t('custom')}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">
                                        {t('permissionsCount', { count: role.permissions.length })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {hasPermission(PermissionEnum.ADMIN_ROLES) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditClick(role)}
                                                    className="h-8 w-8 text-slate-500 hover:text-blue-600"
                                                    title={role.isSystemRole ? t('view') : t('edit')}
                                                >
                                                    {role.isSystemRole ? (
                                                        <Eye className="h-4 w-4" />
                                                    ) : (
                                                        <Edit className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                            {hasPermission(PermissionEnum.ADMIN_ROLES) && !role.isSystemRole && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteClick(role)}
                                                    className="h-8 w-8 text-slate-500 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>



            {selectedRole && (
                <EditRoleDrawer
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    role={selectedRole}
                    onSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
}
