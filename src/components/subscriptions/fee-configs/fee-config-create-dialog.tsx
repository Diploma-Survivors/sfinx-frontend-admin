import { useState } from "react";
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
import { toastService } from "@/services/toasts-service";
import { useTranslations } from "next-intl";

interface FeeConfigCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function FeeConfigCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: FeeConfigCreateDialogProps) {
  const t = useTranslations("Subscription.feeConfigs.dialogs.create");
  const tMsg = useTranslations("Subscription.feeConfigs.messages");
  const [isSaving, setIsSaving] = useState(false);
  const [code, setCode] = useState("");
  const [translations, setTranslations] = useState({
    en: { name: "", description: "" },
    vi: { name: "", description: "" },
  });
  const [value, setValue] = useState("");
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setCode("");
    setTranslations({
      en: { name: "", description: "" },
      vi: { name: "", description: "" },
    });
    setValue("");
    setIsActive(true);
  };

  const handleCreate = async () => {
    if (!code || !value || !translations.en.name || !translations.vi.name) {
      toastService.error(tMsg("fillRequired"));
      return;
    }

    setIsSaving(true);
    try {
      await feeConfigService.create({
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
      toastService.success(tMsg("createSuccess"));
      onOpenChange(false);
      resetForm();
      onSuccess();
    } catch (error: any) {
      toastService.error(error.response?.data?.message || tMsg("createError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fee-name" className="text-right">
              {t("codeLabel")}
            </Label>
            <Input
              id="fee-name"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VAT"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fee-desc" className="text-right">
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
                    placeholder="Value Added Tax"
                  />
                  <Textarea
                    id="fee-desc"
                    value={translations.en.description}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        en: { ...prev.en, description: e.target.value },
                      }))
                    }
                    placeholder="Tax applied to checkout"
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
                    placeholder="Thuế giá trị gia tăng"
                  />
                  <Textarea
                    value={translations.vi.description}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        vi: { ...prev.vi, description: e.target.value },
                      }))
                    }
                    placeholder="Thuế áp dụng khi thanh toán"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fee-value" className="text-right">
              {t("valueLabel")}
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="fee-value"
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="8"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fee-active" className="text-right">
              {t("activeLabel")}
            </Label>
            <div className="col-span-3">
              <Switch
                id="fee-active"
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
          <Button onClick={handleCreate} disabled={isSaving}>
            {isSaving ? t("creatingButton") : t("createButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
