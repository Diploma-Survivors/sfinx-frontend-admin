import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { feeConfigService } from "@/services/fee-config-service";
import { FeeConfig } from "@/types/fee-config";
import { toastService } from "@/services/toasts-service";
import { useTranslations } from "next-intl";

interface FeeConfigEditDialogProps {
  fee: FeeConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function FeeConfigEditDialog({
  fee,
  open,
  onOpenChange,
  onSuccess,
}: FeeConfigEditDialogProps) {
  const t = useTranslations("Subscription.feeConfigs.dialogs.edit");
  const tMsg = useTranslations("Subscription.feeConfigs.messages");
  const [isSaving, setIsSaving] = useState(false);
  const [code, setCode] = useState("");
  const [translations, setTranslations] = useState({
    en: { name: "", description: "" },
    vi: { name: "", description: "" },
  });
  const [value, setValue] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (fee && open) {
      setCode(fee.code);
      const enTranslation = fee.translations?.find((item) => item.languageCode === "en");
      const viTranslation = fee.translations?.find((item) => item.languageCode === "vi");

      setTranslations({
        en: {
          name: enTranslation?.name || fee.code,
          description: enTranslation?.description || "",
        },
        vi: {
          name: viTranslation?.name || "",
          description: viTranslation?.description || "",
        },
      });
      setValue((Number(fee.value) * 100).toString());
      setIsActive(fee.isActive);
    }
  }, [fee, open]);

  const handleSave = async () => {
    if (!fee) return;
    if (!code || !value || !translations.en.name || !translations.vi.name) {
      toastService.error(tMsg("fillRequired"));
      return;
    }

    setIsSaving(true);
    try {
      await feeConfigService.update(fee.id, {
        code,
        value: parseFloat(value) / 100,
        isActive,
        translations: [
          {
            languageCode: "en",
            name: translations.en.name,
            description: translations.en.description || undefined,
          },
          {
            languageCode: "vi",
            name: translations.vi.name,
            description: translations.vi.description || undefined,
          },
        ],
      });
      toastService.success(tMsg("updateSuccess"));
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toastService.error(error.response?.data?.message || tMsg("updateError"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!fee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")} - {fee.code}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-fee-name" className="text-right">
              {t("codeLabel")}
            </Label>
            <Input
              id="edit-fee-name"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-fee-desc" className="text-right">
              {t("descLabel")}
            </Label>
            <div className="col-span-3">
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="mb-2 grid w-full grid-cols-2">
                  <TabsTrigger value="en">EN</TabsTrigger>
                  <TabsTrigger value="vi">VI</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="space-y-2">
                  <Input
                    value={translations.en.name}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        en: { ...prev.en, name: e.target.value },
                      }))
                    }
                  />
                  <Textarea
                    id="edit-fee-desc"
                    value={translations.en.description}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        en: { ...prev.en, description: e.target.value },
                      }))
                    }
                  />
                </TabsContent>
                <TabsContent value="vi" className="space-y-2">
                  <Input
                    value={translations.vi.name}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        vi: { ...prev.vi, name: e.target.value },
                      }))
                    }
                  />
                  <Textarea
                    value={translations.vi.description}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        vi: { ...prev.vi, description: e.target.value },
                      }))
                    }
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-fee-value" className="text-right">
              {t("valueLabel")}
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="edit-fee-value"
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-fee-active" className="text-right">
              {t("activeLabel")}
            </Label>
            <div className="col-span-3">
              <Switch
                id="edit-fee-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t("savingButton") : t("saveButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
