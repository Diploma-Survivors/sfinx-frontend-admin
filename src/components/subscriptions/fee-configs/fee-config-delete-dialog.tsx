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

interface FeeConfigDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fee: { id: number; code: string } | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function FeeConfigDeleteDialog({
  open,
  onOpenChange,
  fee,
  onConfirm,
  isDeleting,
}: FeeConfigDeleteDialogProps) {
  const t = useTranslations("Subscription.feeConfigs.dialogs.delete");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { code: fee?.code || "" })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
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
