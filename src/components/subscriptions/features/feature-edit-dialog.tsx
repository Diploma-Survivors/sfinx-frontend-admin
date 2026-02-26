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
import { subscriptionFeatureService } from "@/services/subscription-feature-service";
import { toastService } from "@/services/toasts-service";
import { useTranslations } from "next-intl";

interface FeatureEditDialogProps {
  feature: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function FeatureEditDialog({
  feature,
  open,
  onOpenChange,
  onSuccess,
}: FeatureEditDialogProps) {
  const t = useTranslations("Subscription");
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [editIsActive, setEditIsActive] = useState(true);
  const [editTranslations, setEditTranslations] = useState({
    en: { name: "", description: "" },
    vi: { name: "", description: "" },
  });

  useEffect(() => {
    if (feature) {
      setEditIsActive(feature.isActive);
      fetchFeatureDetails(feature.id);
    }
  }, [feature]);

  const fetchFeatureDetails = async (id: number) => {
    try {
      const response = await subscriptionFeatureService.getFeature(id);
      const featureData = response.data; // Assuming response structure matches, if not check ApiResponse type handling

      // Extract translations
      const enTranslation = featureData.translations?.find(
        (t: any) => t.languageCode === "en",
      );
      const viTranslation = featureData.translations?.find(
        (t: any) => t.languageCode === "vi",
      );

      setEditTranslations({
        en: {
          name: enTranslation?.name || "",
          description: enTranslation?.description || "",
        },
        vi: {
          name: viTranslation?.name || "",
          description: viTranslation?.description || "",
        },
      });
    } catch (error) {
      toastService.error(t("messages.loadFeatureDetailsError"));
    }
  };

  const handleUpdate = async () => {
    if (!feature) return;

    setIsSaving(true);
    try {
      await subscriptionFeatureService.updateFeature(feature.id, {
        isActive: editIsActive,
        translations: [
          { languageCode: "en", ...editTranslations.en },
          { languageCode: "vi", ...editTranslations.vi },
        ],
      });
      toastService.success(t("messages.updateFeatureSuccess"));
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toastService.error(
        error.response?.data?.message || t("messages.updateFeatureError"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("features.dialogs.edit.title")} - {feature?.key}
          </DialogTitle>
          <DialogDescription>
            {t("features.dialogs.edit.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-active" className="text-right">
              {t("features.dialogs.create.activeLabel")}
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
              {t("features.dialogs.create.translations")}
            </Label>
            <Tabs defaultValue="en">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="en">
                  {t("features.dialogs.create.english")}
                </TabsTrigger>
                <TabsTrigger value="vi">
                  {t("features.dialogs.create.vietnamese")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="en" className="space-y-4">
                <div>
                  <Label htmlFor="edit-en-name">
                    {t("features.dialogs.create.nameLabel")}
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
                    {t("features.dialogs.create.descLabel")}
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
                    {t("features.dialogs.create.nameLabel")}
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
                    {t("features.dialogs.create.descLabel")}
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
            {t("features.dialogs.create.cancel")}
          </Button>
          <Button onClick={handleUpdate} disabled={isSaving}>
            {isSaving
              ? t("features.dialogs.edit.savingButton")
              : t("features.dialogs.edit.saveButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
