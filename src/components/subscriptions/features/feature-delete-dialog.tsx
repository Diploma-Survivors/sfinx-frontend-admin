import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useTranslations } from "next-intl";

interface FeatureDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: { id: number; name: string } | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function FeatureDeleteDialog({
  open,
  onOpenChange,
  feature,
  onConfirm,
  isDeleting,
}: FeatureDeleteDialogProps) {
  const t = useTranslations("Subscription.features.dialogs.delete");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { name: feature?.name ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t("deletingButton") : t("deleteButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
