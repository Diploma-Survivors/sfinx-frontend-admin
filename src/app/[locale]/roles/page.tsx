'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';
import PermissionsTab from '@/components/admin/roles/permissions-tab';
import RolesTab from '@/components/admin/roles/roles-tab';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useApp } from '@/contexts/app-context';
import { PermissionEnum } from '@/types/permission';
import RoleFormDialog from '@/components/admin/roles/role-form-dialog';

export default function RolesPage() {
    const t = useTranslations('RolesPage');
    const tTab = useTranslations('RolesTab');
    const { hasPermission } = useApp();
    const [activeTab, setActiveTab] = useState('roles');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleCreateSuccess = () => {
        setRefreshKey((prev) => prev + 1);
        setIsCreateDialogOpen(false);
    };

    return (
        <div className="container mx-auto py-8 px-6 max-w-7xl">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {t('title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {t('description')}
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-between items-center mb-8">
                        <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="roles">{t('rolesTab')}</TabsTrigger>
                            <TabsTrigger value="permissions">{t('permissionsTab')}</TabsTrigger>
                        </TabsList>
                        
                        {activeTab === 'roles' && hasPermission(PermissionEnum.ADMIN_ROLES) && (
                            <Button onClick={() => setIsCreateDialogOpen(true)} className="ml-4">
                                <Plus className="mr-2 h-4 w-4" />
                                {tTab('addNewRole')}
                            </Button>
                        )}
                    </div>

                    <TabsContent value="roles" className="mt-0">
                        <RolesTab refreshKey={refreshKey} />
                    </TabsContent>

                    <TabsContent value="permissions" className="mt-0">
                        <PermissionsTab />
                    </TabsContent>
                </Tabs>
            </div>
            
            <RoleFormDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}
