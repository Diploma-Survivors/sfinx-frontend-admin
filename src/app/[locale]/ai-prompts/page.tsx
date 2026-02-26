"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { AiPromptService } from "@/services/ai-prompt-service";
import { toastService } from "@/services/toasts-service";
import { PromptStatus } from "@/types/ai-prompt";
import { PromptTable } from "@/components/ai-prompts/prompt-table";
import { PromptFormDialog } from "@/components/ai-prompts/prompt-form-dialog";
import { DeactivateConfirmDialog } from "@/components/ai-prompts/deactivate-confirm-dialog";

export default function AiPromptsPage() {
    const t = useTranslations("AiPrompts");

    const [prompts, setPrompts] = useState<PromptStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState<PromptStatus | null>(null);

    const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
    const [promptToDeactivate, setPromptToDeactivate] = useState<PromptStatus | null>(null);
    const [isDeactivating, setIsDeactivating] = useState(false);

    const [clearingCacheId, setClearingCacheId] = useState<number | null>(null);
    const [isClearingAllCache, setIsClearingAllCache] = useState(false);

    const fetchPrompts = async () => {
        setIsLoading(true);
        try {
            const data = await AiPromptService.getAll();
            setPrompts(data);
        } catch {
            toastService.error(t("loadError"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPrompts();
    }, []);

    const handleEdit = (prompt: PromptStatus) => {
        setEditingPrompt(prompt);
        setFormDialogOpen(true);
    };

    const handleFormDialogClose = (open: boolean) => {
        setFormDialogOpen(open);
        if (!open) setEditingPrompt(null);
    };

    const handleDeactivateClick = (prompt: PromptStatus) => {
        setPromptToDeactivate(prompt);
        setDeactivateDialogOpen(true);
    };

    const confirmDeactivate = async () => {
        if (!promptToDeactivate) return;
        setIsDeactivating(true);
        try {
            await AiPromptService.deactivate(promptToDeactivate.id);
            toastService.success(t("deactivateSuccess"));
            setDeactivateDialogOpen(false);
            setPromptToDeactivate(null);
            fetchPrompts();
        } catch {
            toastService.error(t("deactivateError"));
        } finally {
            setIsDeactivating(false);
        }
    };

    const handleClearCache = async (prompt: PromptStatus) => {
        setClearingCacheId(prompt.id);
        try {
            await AiPromptService.clearCacheByFeature(prompt.featureName);
            toastService.success(t("clearCacheSuccess", { featureName: prompt.featureName }));
            fetchPrompts();
        } catch {
            toastService.error(t("clearCacheError"));
        } finally {
            setClearingCacheId(null);
        }
    };

    const handleClearAllCache = async () => {
        setIsClearingAllCache(true);
        try {
            await AiPromptService.clearAllCache();
            toastService.success(t("clearAllCacheSuccess"));
            fetchPrompts();
        } catch {
            toastService.error(t("clearAllCacheError"));
        } finally {
            setIsClearingAllCache(false);
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {t("description")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClearAllCache}
                        disabled={isClearingAllCache}
                        className="border-slate-200 dark:border-slate-700"
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isClearingAllCache ? "animate-spin" : ""}`}
                        />
                        {t("clearAllCache")}
                    </Button>
                    <Button onClick={() => { setEditingPrompt(null); setFormDialogOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t("addPrompt")}
                    </Button>
                </div>
            </div>

            <PromptTable
                prompts={prompts}
                loading={isLoading}
                onEdit={handleEdit}
                onDeactivate={handleDeactivateClick}
                onClearCache={handleClearCache}
                clearingCacheId={clearingCacheId}
            />

            <PromptFormDialog
                open={formDialogOpen}
                onOpenChange={handleFormDialogClose}
                onSuccess={fetchPrompts}
                editingPrompt={editingPrompt}
            />

            <DeactivateConfirmDialog
                open={deactivateDialogOpen}
                onOpenChange={setDeactivateDialogOpen}
                featureName={promptToDeactivate?.featureName ?? ""}
                onConfirm={confirmDeactivate}
                isDeactivating={isDeactivating}
            />
        </div>
    );
}
