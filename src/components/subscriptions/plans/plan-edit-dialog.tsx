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
import { SubscriptionPlan, SubscriptionType } from "@/types/subscription-plan";
import { toastService } from "@/services/toasts-service";
import { useTranslations } from "next-intl";

interface PlanEditDialogProps {
  plan: SubscriptionPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PlanEditDialog({
  plan,
  open,
  onOpenChange,
  onSuccess,
}: PlanEditDialogProps) {
  const t = useTranslations("Subscription");
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [editType, setEditType] = useState<SubscriptionType>(
    SubscriptionType.MONTHLY,
  );
  const [editPrice, setEditPrice] = useState<string>("");
  const [editDuration, setEditDuration] = useState<string>("");
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editTranslations, setEditTranslations] = useState({
    en: { name: "", description: "" },
    vi: { name: "", description: "" },
  });
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<number[]>([]); // Preserved but not used in UI for now as per previous page.tsx

  useEffect(() => {
    if (plan && open) {
      // Initialize with current partial data first
      setEditType(plan.type);
      setEditPrice(plan.priceUsd.toString());
      setEditDuration(plan.durationMonths.toString());
      setEditIsActive(plan.isActive);
      setSelectedFeatureIds(plan.features.map((f) => f.id));

      const fetchPlanDetails = async () => {
        // setIsLoading(true); // Can add loading state if needed
        try {
          const response = await subscriptionService.getPlan(plan.id);
          const fullPlan = response.data; // Now this has all translations

          // Extract translations from full plan
          const enTrans = fullPlan.translations?.find(
            (t) => t.languageCode === "en",
          );
          const viTrans = fullPlan.translations?.find(
            (t) => t.languageCode === "vi",
          );

          setEditTranslations({
            en: {
              name: enTrans?.name || plan.name || "",
              description: enTrans?.description || plan.description || "",
            },
            vi: {
              name: viTrans?.name || "",
              description: viTrans?.description || "",
            },
          });
        } catch (error) {
          console.warn("Failed to fetch full plan details", error);
          // Fallback to what we have or empty
          const enTrans = plan.translations?.find(
            (t) => t.languageCode === "en",
          ) || { name: plan.name, description: plan.description };
          setEditTranslations((prev) => ({
            ...prev,
            en: {
              name: enTrans.name || "",
              description: enTrans.description || "",
            },
          }));
        }
      };

      fetchPlanDetails();
    }
  }, [plan, open]);

  const handleSave = async () => {
    if (!plan) return;

    if (!editTranslations.en.name || !editTranslations.vi.name) {
      toastService.error(t("messages.nameRequired"));
      return;
    }

    setIsSaving(true);
    try {
      await subscriptionService.updatePlan(plan.id, {
        type: editType,
        priceUsd: parseFloat(editPrice),
        durationMonths: parseInt(editDuration),
        isActive: editIsActive,
        featureIds: selectedFeatureIds,
        translations: [
          { languageCode: "en", ...editTranslations.en },
          { languageCode: "vi", ...editTranslations.vi },
        ],
      });
      toastService.success(t("messages.updateSuccess"));
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toastService.error(t("messages.updateError"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("dialogs.edit.title")} - {plan.name}
          </DialogTitle>
          <DialogDescription>{t("dialogs.edit.description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Edit Form */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-type" className="text-right">
              {t("dialogs.create.typeLabel")}
            </Label>
            <Select
              value={editType}
              onValueChange={(value) => setEditType(value as SubscriptionType)}
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
            <Label htmlFor="edit-price" className="text-right">
              {t("dialogs.create.priceLabel")}
            </Label>
            <Input
              id="edit-price"
              type="number"
              step="0.01"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-duration" className="text-right">
              {t("dialogs.create.durationLabel")}
            </Label>
            <Input
              id="edit-duration"
              type="number"
              min="1"
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-active" className="text-right">
              {t("dialogs.create.activeLabel")}
            </Label>
            <div className="col-span-3">
              <Switch
                id="edit-active"
                checked={editIsActive}
                onCheckedChange={setEditIsActive}
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
                  <Label htmlFor="edit-en-name">
                    {t("dialogs.create.nameLabel")}
                  </Label>
                  <Input
                    id="edit-en-name"
                    value={editTranslations.en.name}
                    onChange={(e) =>
                      setEditTranslations({
                        ...editTranslations,
                        en: { ...editTranslations.en, name: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-en-desc">
                    {t("dialogs.create.descLabel")}
                  </Label>
                  <Textarea
                    id="edit-en-desc"
                    value={editTranslations.en.description}
                    onChange={(e) =>
                      setEditTranslations({
                        ...editTranslations,
                        en: {
                          ...editTranslations.en,
                          description: e.target.value,
                        },
                      })
                    }
                    rows={3}
                  />
                </div>
              </TabsContent>
              <TabsContent value="vi" className="space-y-4">
                <div>
                  <Label htmlFor="edit-vi-name">
                    {t("dialogs.create.nameLabel")}
                  </Label>
                  <Input
                    id="edit-vi-name"
                    value={editTranslations.vi.name}
                    onChange={(e) =>
                      setEditTranslations({
                        ...editTranslations,
                        vi: { ...editTranslations.vi, name: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-vi-desc">
                    {t("dialogs.create.descLabel")}
                  </Label>
                  <Textarea
                    id="edit-vi-desc"
                    value={editTranslations.vi.description}
                    onChange={(e) =>
                      setEditTranslations({
                        ...editTranslations,
                        vi: {
                          ...editTranslations.vi,
                          description: e.target.value,
                        },
                      })
                    }
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
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? t("dialogs.edit.savingButton")
              : t("dialogs.edit.saveButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
