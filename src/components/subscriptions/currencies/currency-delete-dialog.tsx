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

interface CurrencyDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: { id: number; name: string } | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function CurrencyDeleteDialog({
  open,
  onOpenChange,
  currency,
  onConfirm,
  isDeleting,
}: CurrencyDeleteDialogProps) {
  const t = useTranslations("Subscription.currencies.dialogs.delete");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { name: currency?.name || "" })}
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
