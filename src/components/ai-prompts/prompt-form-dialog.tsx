"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AiPromptService } from "@/services/ai-prompt-service";
import { toastService } from "@/services/toasts-service";
import { PromptStatus } from "@/types/ai-prompt";
import { useTranslations } from "next-intl";

interface PromptFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    editingPrompt?: PromptStatus | null;
}

const LABEL_OPTIONS = ["production", "staging", "latest"];

export function PromptFormDialog({
    open,
    onOpenChange,
    onSuccess,
    editingPrompt,
}: PromptFormDialogProps) {
    const t = useTranslations("AiPromptFormDialog");
    const [loading, setLoading] = useState(false);
    const isEditing = !!editingPrompt;

    const formSchema = z.object({
        featureName: z.string().min(1, t("featureNameRequired")).max(100),
        description: z.string().optional(),
        langfusePromptName: z.string().min(1, t("langfusePromptNameRequired")).max(200),
        langfuseLabel: z.string().min(1).max(50),
        isActive: z.boolean(),
    });

    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            featureName: "",
            description: "",
            langfusePromptName: "",
            langfuseLabel: "production",
            isActive: true,
        },
    });

    useEffect(() => {
        if (open) {
            if (editingPrompt) {
                form.reset({
                    featureName: editingPrompt.featureName,
                    description: editingPrompt.description ?? "",
                    langfusePromptName: editingPrompt.langfusePromptName,
                    langfuseLabel: editingPrompt.langfuseLabel,
                    isActive: editingPrompt.isActive,
                });
            } else {
                form.reset({
                    featureName: "",
                    description: "",
                    langfusePromptName: "",
                    langfuseLabel: "production",
                    isActive: true,
                });
            }
        }
    }, [open, editingPrompt]);

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            if (isEditing && editingPrompt) {
                await AiPromptService.update(editingPrompt.id, {
                    description: values.description || undefined,
                    langfusePromptName: values.langfusePromptName,
                    langfuseLabel: values.langfuseLabel,
                    isActive: values.isActive,
                });
                toastService.success(t("updateSuccess"));
            } else {
                await AiPromptService.create({
                    featureName: values.featureName,
                    description: values.description || undefined,
                    langfusePromptName: values.langfusePromptName,
                    langfuseLabel: values.langfuseLabel,
                    isActive: values.isActive,
                });
                toastService.success(t("createSuccess"));
            }
            onOpenChange(false);
            onSuccess();
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            toastService.error(
                axiosError.response?.data?.message ||
                    (isEditing ? t("updateError") : t("createError"))
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? t("editTitle") : t("createTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? t("editDescription") : t("createDescription")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Feature Name — readonly on edit */}
                    <div className="space-y-2">
                        <Label htmlFor="featureName">
                            {t("featureNameLabel")}
                            <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            id="featureName"
                            placeholder={t("featureNamePlaceholder")}
                            className="focus-visible:ring-0 focus-visible:ring-offset-0 font-mono"
                            disabled={isEditing}
                            {...form.register("featureName")}
                        />
                        {form.formState.errors.featureName && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.featureName.message}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">{t("descriptionLabel")}</Label>
                        <Input
                            id="description"
                            placeholder={t("descriptionPlaceholder")}
                            className="focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...form.register("description")}
                        />
                    </div>

                    {/* Langfuse Prompt Name */}
                    <div className="space-y-2">
                        <Label htmlFor="langfusePromptName">
                            {t("langfusePromptNameLabel")}
                            <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            id="langfusePromptName"
                            placeholder={t("langfusePromptNamePlaceholder")}
                            className="focus-visible:ring-0 focus-visible:ring-offset-0 font-mono"
                            {...form.register("langfusePromptName")}
                        />
                        {form.formState.errors.langfusePromptName && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.langfusePromptName.message}
                            </p>
                        )}
                    </div>

                    {/* Langfuse Label */}
                    <div className="space-y-2">
                        <Label>{t("langfuseLabelLabel")}</Label>
                        <Select
                            value={form.watch("langfuseLabel")}
                            onValueChange={(val) => form.setValue("langfuseLabel", val)}
                        >
                            <SelectTrigger className="focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder={t("langfuseLabelPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {LABEL_OPTIONS.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                        {opt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Is Active */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <Label htmlFor="isActive" className="text-sm font-medium">
                                {t("isActiveLabel")}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {t("isActiveDescription")}
                            </p>
                        </div>
                        <Switch
                            id="isActive"
                            checked={form.watch("isActive")}
                            onCheckedChange={(val) => form.setValue("isActive", val)}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            {t("cancel")}
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading
                                ? t("saving")
                                : isEditing
                                ? t("saveChanges")
                                : t("create")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
