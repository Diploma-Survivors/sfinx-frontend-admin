'use client';

import { useState, useEffect } from 'react';
import { subscriptionService } from '@/services/subscription-service';
import { SubscriptionPlan } from '@/types/subscription-plan';
import { toastService } from '@/services/toasts-service';
import { PlanHeader } from '@/components/subscriptions/plans/plan-header';
import { PlanList } from '@/components/subscriptions/plans/plan-list';
import { PlanCreateDialog } from '@/components/subscriptions/plans/plan-create-dialog';
import { PlanEditDialog } from '@/components/subscriptions/plans/plan-edit-dialog';
import { PlanDeleteDialog } from '@/components/subscriptions/plans/plan-delete-dialog';

export default function PlansPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<{ id: number; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await subscriptionService.getAllPlans();
            setPlans(response.data);
        } catch (error) {
            toastService.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    // Edit Handlers
    const handleEdit = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        setEditDialogOpen(true);
    };

    // Delete Handlers
    const handleDeleteClick = (plan: SubscriptionPlan) => {
        setPlanToDelete({ id: plan.id, name: plan.name });
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!planToDelete) return;

        setIsDeleting(true);
        try {
            await subscriptionService.deletePlan(planToDelete.id);
            toastService.success('Plan deleted successfully');
            fetchData();
            setDeleteDialogOpen(false);
            setPlanToDelete(null);
        } catch (error: any) {
            toastService.error(error.response?.data?.message || 'Failed to delete plan');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <PlanHeader
                onRefresh={fetchData}
                onCreate={() => setCreateDialogOpen(true)}
                isLoading={isLoading}
            />

            <PlanList
                plans={plans}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            <PlanCreateDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={fetchData}
            />

            <PlanEditDialog
                plan={editingPlan}
                open={editDialogOpen}
                onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    if (!open) setEditingPlan(null);
                }}
                onSuccess={fetchData}
            />

            <PlanDeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                plan={planToDelete}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}
