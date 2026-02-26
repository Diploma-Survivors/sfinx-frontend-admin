"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface DeactivateConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    featureName: string;
    onConfirm: () => void;
    isDeactivating: boolean;
}

export function DeactivateConfirmDialog({
    open,
    onOpenChange,
    featureName,
    onConfirm,
    isDeactivating,
}: DeactivateConfirmDialogProps) {
    const t = useTranslations("AiPromptDeactivateDialog");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t("title")}</DialogTitle>
                    <DialogDescription>
                        {t("description", { featureName })}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeactivating}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeactivating}
                    >
                        {isDeactivating ? t("deactivating") : t("deactivate")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
