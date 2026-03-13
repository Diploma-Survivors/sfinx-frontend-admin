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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { currencyService } from "@/services/currency-service";
import { CurrencyConfig } from "@/types/currency";
import { toastService } from "@/services/toasts-service";
import { useTranslations } from "next-intl";

interface CurrencyEditDialogProps {
  currency: CurrencyConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CurrencyEditDialog({
  currency,
  open,
  onOpenChange,
  onSuccess,
}: CurrencyEditDialogProps) {
  const t = useTranslations("Subscription.currencies.dialogs.edit");
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

  useEffect(() => {
    if (currency && open) {
      setCode(currency.code);
      setSymbol(currency.symbol);
      setRateToVnd(Number(currency.rateToVnd).toString());
      setIsActive(currency.isActive);

      const enTranslation = currency.translations?.find((item) => item.languageCode === "en");
      const viTranslation = currency.translations?.find((item) => item.languageCode === "vi");

      setTranslations({
        en: {
          name: enTranslation?.name || currency.name,
          symbol: enTranslation?.symbol || currency.symbol,
        },
        vi: {
          name: viTranslation?.name || "",
          symbol: viTranslation?.symbol || "",
        },
      });
    }
  }, [currency, open]);

  const handleSave = async () => {
    if (!currency) return;
    if (!code || !symbol || !rateToVnd || !translations.en.name || !translations.vi.name) {
      toastService.error(tMsg("fillRequired"));
      return;
    }

    setIsSaving(true);
    try {
      await currencyService.update(currency.id, {
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
      toastService.success(tMsg("updateSuccess"));
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toastService.error(error.response?.data?.message || tMsg("updateError"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!currency) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")} - {currency.code}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-curr-code" className="text-right">
              {t("codeLabel")}
            </Label>
            <Input
              id="edit-curr-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={3}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-curr-name" className="text-right">
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
                    id="edit-curr-name"
                    value={translations.en.name}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        en: { ...prev.en, name: e.target.value },
                      }))
                    }
                  />
                  <Input
                    value={translations.en.symbol}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        en: { ...prev.en, symbol: e.target.value },
                      }))
                    }
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
                  />
                  <Input
                    value={translations.vi.symbol}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        vi: { ...prev.vi, symbol: e.target.value },
                      }))
                    }
                    maxLength={5}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-curr-symbol" className="text-right">
              {t("symbolLabel")}
            </Label>
            <Input
              id="edit-curr-symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              maxLength={5}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-curr-rate" className="text-right">
              {t("rateLabel")}
            </Label>
            <Input
              id="edit-curr-rate"
              type="number"
              step="0.01"
              min="0"
              value={rateToVnd}
              onChange={(e) => setRateToVnd(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-curr-active" className="text-right">
              {t("activeLabel")}
            </Label>
            <div className="col-span-3">
              <Switch
                id="edit-curr-active"
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
