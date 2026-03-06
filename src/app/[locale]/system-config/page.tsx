"use client";

import { SystemConfigTable } from "@/components/admin/system-config/system-config-table";
import { UpsertConfigDialog } from "@/components/admin/system-config/upsert-config-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";
import { SystemConfigService } from "@/services/system-config-service";
import { SystemConfig } from "@/types/system-config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SystemConfigPage() {
  const t = useTranslations("SystemConfig.page");
  const { success, error: toastError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<SystemConfig | null>(
    null,
  );
  const [configToDelete, setConfigToDelete] = useState<SystemConfig | null>(
    null,
  );

  const fetchConfigs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await SystemConfigService.getAll();
      setConfigs(data);
    } catch (err) {
      console.error(err);
      toastError(t("errorTitle"));
    } finally {
      setIsLoading(false);
    }
  }, [t, toastError]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleUpsert = async (values: {
    key: string;
    value: string;
    description?: string;
  }) => {
    try {
      await SystemConfigService.upsert(values.key, {
        value: values.value,
        description: values.description,
      });
      success(selectedConfig ? t("updateSuccess") : t("createSuccess"));
      setIsDialogOpen(false);
      setSelectedConfig(null);
      fetchConfigs();
    } catch (err) {
      console.error(err);
      toastError(t("updateError"));
    }
  };

  const handleDelete = (config: SystemConfig) => {
    setConfigToDelete(config);
  };

  const confirmDelete = async () => {
    if (!configToDelete) return;

    try {
      await SystemConfigService.delete(configToDelete.key);
      success(t("deleteSuccess"));
      setConfigToDelete(null);
      fetchConfigs();
    } catch (err) {
      console.error(err);
      toastError(t("deleteError"));
    }
  };

  const handleEdit = (config: SystemConfig) => {
    setSelectedConfig(config);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedConfig(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("description")}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("createButton")}
        </Button>
      </div>

      <div className="bg-background rounded-lg border shadow-sm">
        {isLoading ? (
          <div className="flex justify-center flex-col items-center p-12 text-muted-foreground space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">{t("loading")}</p>
          </div>
        ) : (
          <SystemConfigTable
            configs={configs}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <UpsertConfigDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        config={selectedConfig}
        onSubmit={handleUpsert}
      />

      <AlertDialog
        open={!!configToDelete}
        onOpenChange={(open: boolean) => !open && setConfigToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteTitle", { key: configToDelete?.key || "" })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirm", { key: configToDelete?.key || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancelButton")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              {t("deleteButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
