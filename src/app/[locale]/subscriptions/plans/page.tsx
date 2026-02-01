'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { SubscriptionPlan, SubscriptionFeature, SubscriptionType, subscriptionService } from '@/services/subscription-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Edit, RefreshCw, Trash2, Plus } from 'lucide-react';
import { toastService } from '@/services/toasts-service';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function PlansPage() {
    const t = useTranslations('Subscription');
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [allFeatures, setAllFeatures] = useState<SubscriptionFeature[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Edit state
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [editType, setEditType] = useState<SubscriptionType>(SubscriptionType.MONTHLY);
    const [editPrice, setEditPrice] = useState<string>('');
    const [editDuration, setEditDuration] = useState<string>('');
    const [editIsActive, setEditIsActive] = useState<boolean>(true);
    const [editTranslations, setEditTranslations] = useState({
        en: { name: '', description: '' },
        vi: { name: '', description: '' }
    });
    const [selectedFeatureIds, setSelectedFeatureIds] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Create plan state
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newPlanType, setNewPlanType] = useState<SubscriptionType>(SubscriptionType.MONTHLY);
    const [newPlanPrice, setNewPlanPrice] = useState('');
    const [newPlanDuration, setNewPlanDuration] = useState('1');
    const [newPlanActive, setNewPlanActive] = useState(true);
    const [newPlanTranslations, setNewPlanTranslations] = useState({
        en: { name: '', description: '' },
        vi: { name: '', description: '' }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [plansRes, featuresRes] = await Promise.all([
                subscriptionService.getAllPlans(),
                subscriptionService.getAllFeatures()
            ]);
            setPlans(plansRes.data);
            setAllFeatures(featuresRes.data);
        } catch (error) {
            toastService.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        setEditType(plan.type);
        setEditPrice(plan.priceUsd.toString());
        setEditDuration(plan.durationMonths.toString());
        setEditIsActive(plan.isActive);
        setSelectedFeatureIds(plan.features.map(f => f.id));

        // Fetch full details to get translations if not available in list
        // Assuming getAllPlans might return translations, checking plan object
        // If plan from list has translations we use them, otherwise we might need to fetchDetail
        // But for optimization let's assume getAllPlans returns enough or we use what we have.
        // Actually getAllPlans response usually includes translations.
        // Let's safe guard.

        const enTrans = plan.translations?.find(t => t.languageCode === 'en') || { name: plan.name, description: plan.description };
        const viTrans = plan.translations?.find(t => t.languageCode === 'vi') || { name: '', description: '' };

        setEditTranslations({
            en: { name: enTrans.name || '', description: enTrans.description || '' },
            vi: { name: viTrans.name || '', description: viTrans.description || '' }
        });
    };

    const handleSave = async () => {
        if (!editingPlan) return;

        if (!editTranslations.en.name || !editTranslations.vi.name) {
            toastService.error('Plan name is required for both languages');
            return;
        }

        setIsSaving(true);
        try {
            await subscriptionService.updatePlan(editingPlan.id, {
                type: editType,
                priceUsd: parseFloat(editPrice),
                durationMonths: parseInt(editDuration),
                isActive: editIsActive,
                featureIds: selectedFeatureIds,
                translations: [
                    { languageCode: 'en', ...editTranslations.en },
                    { languageCode: 'vi', ...editTranslations.vi }
                ]
            });
            toastService.success(t('updateSuccess'));
            setEditingPlan(null);
            fetchData();
        } catch (error) {
            toastService.error('Failed to update plan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFeatureToggle = (featureId: number, checked: boolean) => {
        if (checked) {
            setSelectedFeatureIds([...selectedFeatureIds, featureId]);
        } else {
            setSelectedFeatureIds(selectedFeatureIds.filter(id => id !== featureId));
        }
    };

    const handleCreatePlan = async () => {
        if (!newPlanPrice || !newPlanDuration) {
            toastService.error('Please fill in all required fields');
            return;
        }

        if (!newPlanTranslations.en.name || !newPlanTranslations.vi.name) {
            toastService.error('Plan name is required for both languages');
            return;
        }

        setIsSaving(true);
        try {
            await subscriptionService.createPlan({
                type: newPlanType,
                priceUsd: parseFloat(newPlanPrice),
                durationMonths: parseInt(newPlanDuration),
                isActive: newPlanActive,
                translations: [
                    { languageCode: 'en', ...newPlanTranslations.en },
                    { languageCode: 'vi', ...newPlanTranslations.vi }
                ]
            });
            toastService.success('Plan created successfully');
            setCreateDialogOpen(false);
            resetCreateForm();
            fetchData();
        } catch (error: any) {
            toastService.error(error.response?.data?.message || 'Failed to create plan');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePlan = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            await subscriptionService.deletePlan(id);
            toastService.success('Plan deleted successfully');
            fetchData();
        } catch (error: any) {
            toastService.error(error.response?.data?.message || 'Failed to delete plan');
        }
    };

    const resetCreateForm = () => {
        setNewPlanType(SubscriptionType.MONTHLY);
        setNewPlanPrice('');
        setNewPlanDuration('1');
        setNewPlanActive(true);
        setNewPlanTranslations({
            en: { name: '', description: '' },
            vi: { name: '', description: '' }
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t('plans')}</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{t('plansDescription')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={fetchData} variant="outline" disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Plan
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card key={plan.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription className="mt-2 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                                        ${plan.priceUsd} <span className="text-sm font-normal text-slate-500">/ {plan.durationMonths === 1 ? 'month' : 'year'}</span>
                                    </CardDescription>
                                </div>
                                <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                                    {plan.isActive ? t('status.active') : t('status.inactive')}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{plan.description}</p>
                            <ul className="space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature.id} className="flex items-start gap-2">
                                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <span className="text-slate-700 dark:text-slate-200 font-medium">{feature.name}</span>
                                            {feature.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{feature.description}</p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                                {plan.features.length === 0 && (
                                    <li className="text-sm text-slate-500 italic">No features assigned</li>
                                )}
                            </ul>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Dialog open={!!editingPlan && editingPlan.id === plan.id} onOpenChange={(open) => !open && setEditingPlan(null)}>
                                <DialogTrigger asChild>
                                    <Button className="flex-1" onClick={() => handleEdit(plan)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        {t('editPlan')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{t('editPlan')} - {plan.name}</DialogTitle>
                                        <DialogDescription>
                                            Update the pricing, status, and features for this subscription plan.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        {/* Edit Form */}
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-type" className="text-right">
                                                Plan Type
                                            </Label>
                                            <Select
                                                value={editType}
                                                onValueChange={(value) => setEditType(value as SubscriptionType)}
                                            >
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Select plan type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={SubscriptionType.MONTHLY}>Monthly</SelectItem>
                                                    <SelectItem value={SubscriptionType.YEARLY}>Yearly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-price" className="text-right">
                                                Price (USD)
                                            </Label>
                                            <Input
                                                id="edit-price"
                                                type="number"
                                                step="0.01"
                                                value={editPrice}
                                                onChange={(e) => setEditPrice(e.target.value)}
                                                className="col-span-3"
                                            />
                                        </div>

                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="edit-duration" className="text-right">
                                                Duration (months)
                                            </Label>
                                            <Input
                                                id="edit-duration"
                                                type="number"
                                                min="1"
                                                value={editDuration}
                                                onChange={(e) => setEditDuration(e.target.value)}
                                                className="col-span-3"
                                            />
                                        </div>

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
                                        <Button variant="outline" onClick={() => setEditingPlan(null)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSave} disabled={isSaving}>
                                            {isSaving ? 'Saving...' : 'Save changes'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Button
                                variant="destructive"
                                onClick={() => handleDeletePlan(plan.id, plan.name)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Create Plan Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Plan</DialogTitle>
                        <DialogDescription>
                            Add a new subscription plan with translations
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Plan Type *
                            </Label>
                            <Select
                                value={newPlanType}
                                onValueChange={(value) => setNewPlanType(value as SubscriptionType)}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select plan type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={SubscriptionType.MONTHLY}>Monthly</SelectItem>
                                    <SelectItem value={SubscriptionType.YEARLY}>Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Price (USD) *
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={newPlanPrice}
                                onChange={(e) => setNewPlanPrice(e.target.value)}
                                placeholder="9.99"
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="duration" className="text-right">
                                Duration (months) *
                            </Label>
                            <Input
                                id="duration"
                                type="number"
                                min="1"
                                value={newPlanDuration}
                                onChange={(e) => setNewPlanDuration(e.target.value)}
                                placeholder="1"
                                className="col-span-3"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="create-active" className="text-right">
                                Active
                            </Label>
                            <div className="col-span-3">
                                <Switch
                                    id="create-active"
                                    checked={newPlanActive}
                                    onCheckedChange={setNewPlanActive}
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
                                            value={newPlanTranslations.en.name}
                                            onChange={(e) => setNewPlanTranslations({
                                                ...newPlanTranslations,
                                                en: { ...newPlanTranslations.en, name: e.target.value }
                                            })}
                                            placeholder="Monthly Pro"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="en-desc">Description</Label>
                                        <Textarea
                                            id="en-desc"
                                            value={newPlanTranslations.en.description}
                                            onChange={(e) => setNewPlanTranslations({
                                                ...newPlanTranslations,
                                                en: { ...newPlanTranslations.en, description: e.target.value }
                                            })}
                                            placeholder="Unlock all premium features for one month"
                                            rows={3}
                                        />
                                    </div>
                                </TabsContent>
                                <TabsContent value="vi" className="space-y-4">
                                    <div>
                                        <Label htmlFor="vi-name">Name *</Label>
                                        <Input
                                            id="vi-name"
                                            value={newPlanTranslations.vi.name}
                                            onChange={(e) => setNewPlanTranslations({
                                                ...newPlanTranslations,
                                                vi: { ...newPlanTranslations.vi, name: e.target.value }
                                            })}
                                            placeholder="Gói Tháng Pro"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="vi-desc">Description</Label>
                                        <Textarea
                                            id="vi-desc"
                                            value={newPlanTranslations.vi.description}
                                            onChange={(e) => setNewPlanTranslations({
                                                ...newPlanTranslations,
                                                vi: { ...newPlanTranslations.vi, description: e.target.value }
                                            })}
                                            placeholder="Mở khóa tất cả tính năng cao cấp trong một tháng"
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
                        <Button onClick={handleCreatePlan} disabled={isSaving}>
                            {isSaving ? 'Creating...' : 'Create Plan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
