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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { currencyService } from "@/services/currency-service";
import { toastService } from "@/services/toasts-service";
import { useTranslations } from "next-intl";

interface CurrencyCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CurrencyCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: CurrencyCreateDialogProps) {
  const t = useTranslations("Subscription.currencies.dialogs.create");
  const tMsg = useTranslations("Subscription.currencies.messages");
  const [isSaving, setIsSaving] = useState(false);
  const [code, setCode] = useState("");
  const [symbol, setSymbol] = useState("");
  const [rateToVnd, setRateToVnd] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [translations, setTranslations] = useState({
    en: { name: "", symbol: "" },
    vi: { name: "", symbol: "" },
  });

  const resetForm = () => {
    setCode("");
    setSymbol("");
    setRateToVnd("");
    setIsActive(true);
    setTranslations({
      en: { name: "", symbol: "" },
      vi: { name: "", symbol: "" },
    });
  };

  const handleCreate = async () => {
    if (!code || !symbol || !rateToVnd || !translations.en.name || !translations.vi.name) {
      toastService.error(tMsg("fillRequired"));
      return;
    }

    setIsSaving(true);
    try {
      await currencyService.create({
        code: code.toUpperCase(),
        name: translations.en.name,
        symbol,
        rateToVnd: parseFloat(rateToVnd),
        isActive,
        translations: [
          {
            languageCode: "en",
            name: translations.en.name,
            symbol: translations.en.symbol || undefined,
          },
          {
            languageCode: "vi",
            name: translations.vi.name,
            symbol: translations.vi.symbol || undefined,
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
            <Label htmlFor="curr-code" className="text-right">
              {t("codeLabel")}
            </Label>
            <Input
              id="curr-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="USD"
              maxLength={3}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="curr-name" className="text-right">
              {t("nameLabel")}
            </Label>
            <div className="col-span-3">
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="mb-2 grid w-full grid-cols-2">
                  <TabsTrigger value="en">EN</TabsTrigger>
                  <TabsTrigger value="vi">VI</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="space-y-2">
                  <Input
                    id="curr-name"
                    value={translations.en.name}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        en: { ...prev.en, name: e.target.value },
                      }))
                    }
                    placeholder="US Dollar"
                  />
                  <Input
                    value={translations.en.symbol}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        en: { ...prev.en, symbol: e.target.value },
                      }))
                    }
                    placeholder="$"
                    maxLength={5}
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
                    placeholder="Đô la Mỹ"
                  />
                  <Input
                    value={translations.vi.symbol}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        vi: { ...prev.vi, symbol: e.target.value },
                      }))
                    }
                    placeholder="$"
                    maxLength={5}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="curr-symbol" className="text-right">
              {t("symbolLabel")}
            </Label>
            <Input
              id="curr-symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="$"
              maxLength={5}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="curr-rate" className="text-right">
              {t("rateLabel")}
            </Label>
            <Input
              id="curr-rate"
              type="number"
              step="0.01"
              min="0"
              value={rateToVnd}
              onChange={(e) => setRateToVnd(e.target.value)}
              placeholder="25500"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="curr-active" className="text-right">
              {t("activeLabel")}
            </Label>
            <div className="col-span-3">
              <Switch
                id="curr-active"
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
