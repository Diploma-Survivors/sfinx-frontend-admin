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

export default function SystemConfigPage() {
  const t = useTranslations("SystemConfig.page");
  const { success, error: toastError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<SystemConfig | null>(
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

  const handleDelete = async (config: SystemConfig) => {
    if (window.confirm(t("deleteConfirm", { key: config.key }))) {
      try {
        await SystemConfigService.delete(config.key);
        success(t("deleteSuccess"));
        fetchConfigs();
      } catch (err) {
        console.error(err);
        toastError(t("deleteError"));
      }
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
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("createButton")}
        </Button>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6">
        {isLoading ? (
          <div className="flex justify-center p-8">Loading...</div>
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
    </div>
  );
}
