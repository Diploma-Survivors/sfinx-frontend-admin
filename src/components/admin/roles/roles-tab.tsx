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

export default function RolesTab() {
    const t = useTranslations('RolesTab');
    const { hasPermission } = useApp();
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

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
    }, []);

    const handleCreateSuccess = () => {
        fetchRoles();
        setIsCreateDialogOpen(false);
    };

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

    const filteredRoles = roles.filter((role) =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 w-full md:max-w-sm bg-white">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {hasPermission(PermissionEnum.ADMIN_ROLES) && (
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full md:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('addNewRole')}
                    </Button>
                )}
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

            <RoleFormDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={handleCreateSuccess}
            />

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
