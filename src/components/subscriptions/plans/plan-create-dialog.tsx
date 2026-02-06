import { useState } from 'react';
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
import { SubscriptionType } from '@/types/subscription-plan';
import { toastService } from '@/services/toasts-service';

interface PlanCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function PlanCreateDialog({ open, onOpenChange, onSuccess }: PlanCreateDialogProps) {
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [newPlanType, setNewPlanType] = useState<SubscriptionType>(SubscriptionType.MONTHLY);
    const [newPlanPrice, setNewPlanPrice] = useState('');
    const [newPlanDuration, setNewPlanDuration] = useState('1');
    const [newPlanActive, setNewPlanActive] = useState(true);
    const [newPlanTranslations, setNewPlanTranslations] = useState({
        en: { name: '', description: '' },
        vi: { name: '', description: '' }
    });

    const resetForm = () => {
        setNewPlanType(SubscriptionType.MONTHLY);
        setNewPlanPrice('');
        setNewPlanDuration('1');
        setNewPlanActive(true);
        setNewPlanTranslations({
            en: { name: '', description: '' },
            vi: { name: '', description: '' }
        });
    };

    const handleCreate = async () => {
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
            onOpenChange(false);
            resetForm();
            onSuccess();
        } catch (error: any) {
            toastService.error(error.response?.data?.message || 'Failed to create plan');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={isSaving}>
                        {isSaving ? 'Creating...' : 'Create Plan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
