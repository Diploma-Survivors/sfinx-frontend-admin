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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { subscriptionFeatureService } from '@/services/subscription-feature-service';
import { toastService } from '@/services/toasts-service';

interface FeatureCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function FeatureCreateDialog({ open, onOpenChange, onSuccess }: FeatureCreateDialogProps) {
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [newFeatureKey, setNewFeatureKey] = useState('');
    const [newFeatureActive, setNewFeatureActive] = useState(true);
    const [newTranslations, setNewTranslations] = useState({
        en: { name: '', description: '' },
        vi: { name: '', description: '' }
    });

    const resetForm = () => {
        setNewFeatureKey('');
        setNewFeatureActive(true);
        setNewTranslations({
            en: { name: '', description: '' },
            vi: { name: '', description: '' }
        });
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
            await subscriptionFeatureService.createFeature({
                key: newFeatureKey.toLowerCase().replace(/\s+/g, '_'),
                isActive: newFeatureActive,
                translations: [
                    { languageCode: 'en', ...newTranslations.en },
                    { languageCode: 'vi', ...newTranslations.vi }
                ]
            });
            toastService.success('Feature created successfully');
            onOpenChange(false);
            resetForm();
            onSuccess();
        } catch (error: any) {
            toastService.error(error.response?.data?.message || 'Failed to create feature');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={isSaving}>
                        {isSaving ? 'Creating...' : 'Create Feature'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
