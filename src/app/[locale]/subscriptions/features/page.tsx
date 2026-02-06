'use client';

import { useState, useEffect } from 'react';
import { subscriptionFeatureService } from '@/services/subscription-feature-service';
import { toastService } from '@/services/toasts-service';
import { FeatureHeader } from '@/components/subscriptions/features/feature-header';
import { FeatureTable } from '@/components/subscriptions/features/feature-table';
import { FeatureCreateDialog } from '@/components/subscriptions/features/feature-create-dialog';
import { FeatureEditDialog } from '@/components/subscriptions/features/feature-edit-dialog';

export default function FeaturesPage() {
    const [features, setFeatures] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<any | null>(null);

    useEffect(() => {
        fetchFeatures();
    }, []);

    const fetchFeatures = async () => {
        setIsLoading(true);
        try {
            const response = await subscriptionFeatureService.getAllFeatures('en');
            setFeatures(response.data);
        } catch (error) {
            toastService.error('Failed to load features');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            await subscriptionFeatureService.deleteFeature(id);
            toastService.success('Feature deleted successfully');
            fetchFeatures();
        } catch (error: any) {
            toastService.error(error.response?.data?.message || 'Failed to delete feature');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <FeatureHeader
                onRefresh={fetchFeatures}
                onCreate={() => setCreateDialogOpen(true)}
                isLoading={isLoading}
            />

            <FeatureTable
                features={features}
                isLoading={isLoading}
                onEdit={setEditingFeature}
                onDelete={handleDelete}
            />

            <FeatureCreateDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={fetchFeatures}
            />

            <FeatureEditDialog
                feature={editingFeature}
                open={!!editingFeature}
                onOpenChange={(open) => !open && setEditingFeature(null)}
                onSuccess={fetchFeatures}
            />
        </div>
    );
}
