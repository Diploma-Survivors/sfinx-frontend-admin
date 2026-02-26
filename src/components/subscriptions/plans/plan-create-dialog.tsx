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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { subscriptionService } from "@/services/subscription-service";
import { SubscriptionType } from "@/types/subscription-plan";
import { toastService } from "@/services/toasts-service";
import { useTranslations } from "next-intl";

interface PlanCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PlanCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: PlanCreateDialogProps) {
  const t = useTranslations("Subscription");
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [newPlanType, setNewPlanType] = useState<SubscriptionType>(
    SubscriptionType.MONTHLY,
  );
  const [newPlanPrice, setNewPlanPrice] = useState("");
  const [newPlanDuration, setNewPlanDuration] = useState("1");
  const [newPlanActive, setNewPlanActive] = useState(true);
  const [newPlanTranslations, setNewPlanTranslations] = useState({
    en: { name: "", description: "" },
    vi: { name: "", description: "" },
  });

  const resetForm = () => {
    setNewPlanType(SubscriptionType.MONTHLY);
    setNewPlanPrice("");
    setNewPlanDuration("1");
    setNewPlanActive(true);
    setNewPlanTranslations({
      en: { name: "", description: "" },
      vi: { name: "", description: "" },
    });
  };

  const handleCreate = async () => {
    if (!newPlanPrice || !newPlanDuration) {
      toastService.error(t("messages.fillRequired"));
      return;
    }

    if (!newPlanTranslations.en.name || !newPlanTranslations.vi.name) {
      toastService.error(t("messages.nameRequired"));
      return;
    }

    setIsSaving(true);
    try {
      await subscriptionService.createPlan({
        type: newPlanType,
        priceUsd: parseFloat(newPlanPrice),
        durationMonths: parseInt(newPlanDuration),
        isActive: newPlanActive,
        translations: [
          { languageCode: "en", ...newPlanTranslations.en },
          { languageCode: "vi", ...newPlanTranslations.vi },
        ],
      });
      toastService.success(t("messages.createSuccess"));
      onOpenChange(false);
      resetForm();
      onSuccess();
    } catch (error: any) {
      toastService.error(
        error.response?.data?.message || t("messages.createError"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("dialogs.create.title")}</DialogTitle>
          <DialogDescription>
            {t("dialogs.create.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              {t("dialogs.create.typeLabel")}
            </Label>
            <Select
              value={newPlanType}
              onValueChange={(value) =>
                setNewPlanType(value as SubscriptionType)
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("dialogs.create.selectType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SubscriptionType.MONTHLY}>
                  {t("dialogs.create.monthly")}
                </SelectItem>
                <SelectItem value={SubscriptionType.YEARLY}>
                  {t("dialogs.create.yearly")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              {t("dialogs.create.priceLabel")}
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={newPlanPrice}
              onChange={(e) => setNewPlanPrice(e.target.value)}
              placeholder="9.99"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              {t("dialogs.create.durationLabel")}
            </Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={newPlanDuration}
              onChange={(e) => setNewPlanDuration(e.target.value)}
              placeholder="1"
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="create-active" className="text-right">
              {t("dialogs.create.activeLabel")}
            </Label>
            <div className="col-span-3">
              <Switch
                id="create-active"
                checked={newPlanActive}
                onCheckedChange={setNewPlanActive}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="font-semibold mb-2 block">
              {t("dialogs.create.translations")}
            </Label>
            <Tabs defaultValue="en">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="en">
                  {t("dialogs.create.english")}
                </TabsTrigger>
                <TabsTrigger value="vi">
                  {t("dialogs.create.vietnamese")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="en" className="space-y-4">
                <div>
                  <Label htmlFor="en-name">
                    {t("dialogs.create.nameLabel")}
                  </Label>
                  <Input
                    id="en-name"
                    value={newPlanTranslations.en.name}
                    onChange={(e) =>
                      setNewPlanTranslations({
                        ...newPlanTranslations,
                        en: { ...newPlanTranslations.en, name: e.target.value },
                      })
                    }
                    placeholder="Monthly Pro"
                  />
                </div>
                <div>
                  <Label htmlFor="en-desc">
                    {t("dialogs.create.descLabel")}
                  </Label>
                  <Textarea
                    id="en-desc"
                    value={newPlanTranslations.en.description}
                    onChange={(e) =>
                      setNewPlanTranslations({
                        ...newPlanTranslations,
                        en: {
                          ...newPlanTranslations.en,
                          description: e.target.value,
                        },
                      })
                    }
                    placeholder="Unlock all premium features for one month"
                    rows={3}
                  />
                </div>
              </TabsContent>
              <TabsContent value="vi" className="space-y-4">
                <div>
                  <Label htmlFor="vi-name">
                    {t("dialogs.create.nameLabel")}
                  </Label>
                  <Input
                    id="vi-name"
                    value={newPlanTranslations.vi.name}
                    onChange={(e) =>
                      setNewPlanTranslations({
                        ...newPlanTranslations,
                        vi: { ...newPlanTranslations.vi, name: e.target.value },
                      })
                    }
                    placeholder="Gói Tháng Pro"
                  />
                </div>
                <div>
                  <Label htmlFor="vi-desc">
                    {t("dialogs.create.descLabel")}
                  </Label>
                  <Textarea
                    id="vi-desc"
                    value={newPlanTranslations.vi.description}
                    onChange={(e) =>
                      setNewPlanTranslations({
                        ...newPlanTranslations,
                        vi: {
                          ...newPlanTranslations.vi,
                          description: e.target.value,
                        },
                      })
                    }
                    placeholder="Mở khóa tất cả tính năng cao cấp trong một tháng"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("dialogs.create.cancel")}
          </Button>
          <Button onClick={handleCreate} disabled={isSaving}>
            {isSaving
              ? t("dialogs.create.creatingButton")
              : t("dialogs.create.createButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
