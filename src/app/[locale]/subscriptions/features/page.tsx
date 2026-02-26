"use client";

import { useState, useEffect } from "react";
import { subscriptionFeatureService } from "@/services/subscription-feature-service";
import { toastService } from "@/services/toasts-service";
import { FeatureHeader } from "@/components/subscriptions/features/feature-header";
import { FeatureTable } from "@/components/subscriptions/features/feature-table";
import { FeatureCreateDialog } from "@/components/subscriptions/features/feature-create-dialog";
import { FeatureEditDialog } from "@/components/subscriptions/features/feature-edit-dialog";
import { FeatureDeleteDialog } from "@/components/subscriptions/features/feature-delete-dialog";
import { useTranslations, useLocale } from "next-intl";

export default function FeaturesPage() {
  const t = useTranslations("Subscription");
  const locale = useLocale();
  const [features, setFeatures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchFeatures();
  }, [locale]);

  const fetchFeatures = async () => {
    setIsLoading(true);
    try {
      const response = await subscriptionFeatureService.getAllFeatures(locale);
      setFeatures(response.data);
    } catch (error) {
      toastService.error(t("messages.loadFeaturesError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    setFeatureToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!featureToDelete) return;

    setIsDeleting(true);
    try {
      await subscriptionFeatureService.deleteFeature(featureToDelete.id);
      toastService.success(t("messages.deleteFeatureSuccess"));
      setDeleteDialogOpen(false);
      setFeatureToDelete(null);
      fetchFeatures();
    } catch (error: any) {
      toastService.error(
        error.response?.data?.message || t("messages.deleteFeatureError"),
      );
    } finally {
      setIsDeleting(false);
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

      <FeatureDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        feature={featureToDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
