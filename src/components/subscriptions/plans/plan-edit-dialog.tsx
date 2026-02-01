import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { subscriptionService } from '@/services/subscription-service';
import { SubscriptionPlan, SubscriptionType } from '@/types/subscription-plan';
import { toastService } from '@/services/toasts-service';
import { useTranslations } from 'next-intl';

interface PlanEditDialogProps {
    plan: SubscriptionPlan | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function PlanEditDialog({ plan, open, onOpenChange, onSuccess }: PlanEditDialogProps) {
    const t = useTranslations('Subscription');
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [editType, setEditType] = useState<SubscriptionType>(SubscriptionType.MONTHLY);
    const [editPrice, setEditPrice] = useState<string>('');
    const [editDuration, setEditDuration] = useState<string>('');
    const [editIsActive, setEditIsActive] = useState<boolean>(true);
    const [editTranslations, setEditTranslations] = useState({
        en: { name: '', description: '' },
        vi: { name: '', description: '' }
    });
    const [selectedFeatureIds, setSelectedFeatureIds] = useState<number[]>([]); // Preserved but not used in UI for now as per previous page.tsx

    useEffect(() => {
        if (plan && open) {
            // Initialize with current partial data first
            setEditType(plan.type);
            setEditPrice(plan.priceUsd.toString());
            setEditDuration(plan.durationMonths.toString());
            setEditIsActive(plan.isActive);
            setSelectedFeatureIds(plan.features.map(f => f.id));

            const fetchPlanDetails = async () => {
                // setIsLoading(true); // Can add loading state if needed
                try {
                    const response = await subscriptionService.getPlan(plan.id);
                    const fullPlan = response.data; // Now this has all translations

                    // Extract translations from full plan
                    const enTrans = fullPlan.translations?.find(t => t.languageCode === 'en');
                    const viTrans = fullPlan.translations?.find(t => t.languageCode === 'vi');

                    setEditTranslations({
                        en: {
                            name: enTrans?.name || plan.name || '',
                            description: enTrans?.description || plan.description || ''
                        },
                        vi: {
                            name: viTrans?.name || '',
                            description: viTrans?.description || ''
                        }
                    });
                } catch (error) {
                    console.warn('Failed to fetch full plan details', error);
                    // Fallback to what we have or empty
                    const enTrans = plan.translations?.find(t => t.languageCode === 'en') || { name: plan.name, description: plan.description };
                    setEditTranslations(prev => ({
                        ...prev,
                        en: { name: enTrans.name || '', description: enTrans.description || '' }
                    }));
                }
            };

            fetchPlanDetails();
        }
    }, [plan, open]);

    const handleSave = async () => {
        if (!plan) return;

        if (!editTranslations.en.name || !editTranslations.vi.name) {
            toastService.error('Plan name is required for both languages');
            return;
        }

        setIsSaving(true);
        try {
            await subscriptionService.updatePlan(plan.id, {
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
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            toastService.error('Failed to update plan');
        } finally {
            setIsSaving(false);
        }
    };

    if (!plan) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
