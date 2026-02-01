'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { subscriptionService, SubscriptionFeature } from '@/services/subscription-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { toastService } from '@/services/toasts-service';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface FeatureTranslation {
    languageCode: string;
    name: string;
    description: string;
}

export default function FeaturesPage() {
    const t = useTranslations('Subscription');
    const [features, setFeatures] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<any | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Create form state
    const [newFeatureKey, setNewFeatureKey] = useState('');
    const [newFeatureActive, setNewFeatureActive] = useState(true);
    const [newTranslations, setNewTranslations] = useState({
        en: { name: '', description: '' },
        vi: { name: '', description: '' }
    });

    // Edit form state
    const [editIsActive, setEditIsActive] = useState(true);
    const [editTranslations, setEditTranslations] = useState({
        en: { name: '', description: '' },
        vi: { name: '', description: '' }
    });

    useEffect(() => {
        fetchFeatures();
    }, []);

    const fetchFeatures = async () => {
        setIsLoading(true);
        try {
            const response = await subscriptionService.getAllFeatures('en');
            setFeatures(response.data);
        } catch (error) {
            toastService.error('Failed to load features');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newFeatureKey.trim()) {
            toastService.error('Feature key is required');
            return;
        }

        if (!newTranslations.en.name.trim() || !newTranslations.vi.name.trim()) {
            toastService.error('Feature name is required for both languages');
            return;
        }

        setIsSaving(true);
        try {
            await subscriptionService.createFeature({
                key: newFeatureKey.toLowerCase().replace(/\s+/g, '_'),
                isActive: newFeatureActive,
                translations: [
                    { languageCode: 'en', ...newTranslations.en },
                    { languageCode: 'vi', ...newTranslations.vi }
                ]
            });
            toastService.success('Feature created successfully');
            setCreateDialogOpen(false);
            resetCreateForm();
            fetchFeatures();
        } catch (error: any) {
            toastService.error(error.response?.data?.message || 'Failed to create feature');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (feature: any) => {
        setEditingFeature(feature);
        setEditIsActive(feature.isActive);

        // Extract translations
        const enTranslation = feature.translations?.find((t: any) => t.languageCode === 'en');
        const viTranslation = feature.translations?.find((t: any) => t.languageCode === 'vi');

        setEditTranslations({
            en: {
                name: enTranslation?.name || '',
                description: enTranslation?.description || ''
            },
            vi: {
                name: viTranslation?.name || '',
                description: viTranslation?.description || ''
            }
        });
    };

    const handleUpdate = async () => {
        if (!editingFeature) return;

        setIsSaving(true);
        try {
            await subscriptionService.updateFeature(editingFeature.id, {
                isActive: editIsActive,
                translations: [
                    { languageCode: 'en', ...editTranslations.en },
                    { languageCode: 'vi', ...editTranslations.vi }
                ]
            });
            toastService.success('Feature updated successfully');
            setEditingFeature(null);
            fetchFeatures();
        } catch (error: any) {
            toastService.error(error.response?.data?.message || 'Failed to update feature');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            await subscriptionService.deleteFeature(id);
            toastService.success('Feature deleted successfully');
            fetchFeatures();
        } catch (error: any) {
            toastService.error(error.response?.data?.message || 'Failed to delete feature');
        }
    };

    const resetCreateForm = () => {
        setNewFeatureKey('');
        setNewFeatureActive(true);
        setNewTranslations({
            en: { name: '', description: '' },
            vi: { name: '', description: '' }
        });
    };

    const getFeatureName = (feature: any) => {
        const enTranslation = feature.translations?.find((t: any) => t.languageCode === 'en');
        return enTranslation?.name || feature.key;
    };

    const getFeatureDescription = (feature: any) => {
        const enTranslation = feature.translations?.find((t: any) => t.languageCode === 'en');
        return enTranslation?.description || '';
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Features</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Manage subscription features</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={fetchFeatures} variant="outline" disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Feature
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Features</CardTitle>
                    <CardDescription>Manage subscription features and translations</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Key</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                                    </TableCell>
                                </TableRow>
                            ) : features.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                        No features found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                features.map((feature) => (
                                    <TableRow key={feature.id}>
                                        <TableCell className="font-mono text-sm">{feature.key}</TableCell>
                                        <TableCell className="font-medium">{getFeatureName(feature)}</TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-400 max-w-md truncate">
                                            {getFeatureDescription(feature)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={feature.isActive ? 'default' : 'secondary'}>
                                                {feature.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEdit(feature)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(feature.id, getFeatureName(feature))}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Feature Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Feature</DialogTitle>
                        <DialogDescription>
                            Add a new subscription feature with translations
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="key" className="text-right">
                                Feature Key *
                            </Label>
                            <Input
                                id="key"
                                value={newFeatureKey}
                                onChange={(e) => setNewFeatureKey(e.target.value)}
                                placeholder="unlimited_submissions"
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="active" className="text-right">
                                Active
                            </Label>
                            <div className="col-span-3">
                                <Switch
                                    id="active"
                                    checked={newFeatureActive}
                                    onCheckedChange={setNewFeatureActive}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <Label className="font-semibold mb-2 block">Translations</Label>
                            <Tabs defaultValue="en">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="en">English</TabsTrigger>
                                    <TabsTrigger value="vi">Vietnamese</TabsTrigger>
                                </TabsList>
                                <TabsContent value="en" className="space-y-4">
                                    <div>
                                        <Label htmlFor="en-name">Name *</Label>
                                        <Input
                                            id="en-name"
                                            value={newTranslations.en.name}
                                            onChange={(e) => setNewTranslations({
                                                ...newTranslations,
                                                en: { ...newTranslations.en, name: e.target.value }
                                            })}
                                            placeholder="Unlimited Submissions"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="en-desc">Description</Label>
                                        <Textarea
                                            id="en-desc"
                                            value={newTranslations.en.description}
                                            onChange={(e) => setNewTranslations({
                                                ...newTranslations,
                                                en: { ...newTranslations.en, description: e.target.value }
                                            })}
                                            placeholder="Submit code without daily limits"
                                            rows={3}
                                        />
                                    </div>
                                </TabsContent>
                                <TabsContent value="vi" className="space-y-4">
                                    <div>
                                        <Label htmlFor="vi-name">Name *</Label>
                                        <Input
                                            id="vi-name"
                                            value={newTranslations.vi.name}
                                            onChange={(e) => setNewTranslations({
                                                ...newTranslations,
                                                vi: { ...newTranslations.vi, name: e.target.value }
                                            })}
                                            placeholder="Không giới hạn nộp bài"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="vi-desc">Description</Label>
                                        <Textarea
                                            id="vi-desc"
                                            value={newTranslations.vi.description}
                                            onChange={(e) => setNewTranslations({
                                                ...newTranslations,
                                                vi: { ...newTranslations.vi, description: e.target.value }
                                            })}
                                            placeholder="Nộp bài không giới hạn trong ngày"
                                            rows={3}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={isSaving}>
                            {isSaving ? 'Creating...' : 'Create Feature'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Feature Dialog */}
            <Dialog open={!!editingFeature} onOpenChange={(open) => !open && setEditingFeature(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Feature - {editingFeature?.key}</DialogTitle>
                        <DialogDescription>
                            Update feature status and translations
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-active" className="text-right">
                                Active
                            </Label>
                            <div className="col-span-3">
                                <Switch
                                    id="edit-active"
                                    checked={editIsActive}
                                    onCheckedChange={setEditIsActive}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <Label className="font-semibold mb-2 block">Translations</Label>
                            <Tabs defaultValue="en">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="en">English</TabsTrigger>
                                    <TabsTrigger value="vi">Vietnamese</TabsTrigger>
                                </TabsList>
                                <TabsContent value="en" className="space-y-4">
                                    <div>
                                        <Label htmlFor="edit-en-name">Name *</Label>
                                        <Input
                                            id="edit-en-name"
                                            value={editTranslations.en.name}
                                            onChange={(e) => setEditTranslations({
                                                ...editTranslations,
                                                en: { ...editTranslations.en, name: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-en-desc">Description</Label>
                                        <Textarea
                                            id="edit-en-desc"
                                            value={editTranslations.en.description}
                                            onChange={(e) => setEditTranslations({
                                                ...editTranslations,
                                                en: { ...editTranslations.en, description: e.target.value }
                                            })}
                                            rows={3}
                                        />
                                    </div>
                                </TabsContent>
                                <TabsContent value="vi" className="space-y-4">
                                    <div>
                                        <Label htmlFor="edit-vi-name">Name *</Label>
                                        <Input
                                            id="edit-vi-name"
                                            value={editTranslations.vi.name}
                                            onChange={(e) => setEditTranslations({
                                                ...editTranslations,
                                                vi: { ...editTranslations.vi, name: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-vi-desc">Description</Label>
                                        <Textarea
                                            id="edit-vi-desc"
                                            value={editTranslations.vi.description}
                                            onChange={(e) => setEditTranslations({
                                                ...editTranslations,
                                                vi: { ...editTranslations.vi, description: e.target.value }
                                            })}
                                            rows={3}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingFeature(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
