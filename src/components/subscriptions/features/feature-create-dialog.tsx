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
import { subscriptionFeatureService } from "@/services/subscription-feature-service";
import { toastService } from "@/services/toasts-service";
import { useTranslations } from "next-intl";

interface FeatureCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function FeatureCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: FeatureCreateDialogProps) {
  const t = useTranslations("Subscription");
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [newFeatureKey, setNewFeatureKey] = useState("");
  const [newFeatureActive, setNewFeatureActive] = useState(true);
  const [newTranslations, setNewTranslations] = useState({
    en: { name: "", description: "" },
    vi: { name: "", description: "" },
  });

  const resetForm = () => {
    setNewFeatureKey("");
    setNewFeatureActive(true);
    setNewTranslations({
      en: { name: "", description: "" },
      vi: { name: "", description: "" },
    });
  };

  const handleCreate = async () => {
    if (!newFeatureKey.trim()) {
      toastService.error(t("messages.keyRequired"));
      return;
    }

    if (!newTranslations.en.name.trim() || !newTranslations.vi.name.trim()) {
      toastService.error(t("messages.featureNameRequired"));
      return;
    }

    setIsSaving(true);
    try {
      await subscriptionFeatureService.createFeature({
        key: newFeatureKey.toLowerCase().replace(/\s+/g, "_"),
        isActive: newFeatureActive,
        translations: [
          { languageCode: "en", ...newTranslations.en },
          { languageCode: "vi", ...newTranslations.vi },
        ],
      });
      toastService.success(t("messages.createFeatureSuccess"));
      onOpenChange(false);
      resetForm();
      onSuccess();
    } catch (error: any) {
      toastService.error(
        error.response?.data?.message || t("messages.createFeatureError"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("features.dialogs.create.title")}</DialogTitle>
          <DialogDescription>
            {t("features.dialogs.create.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="key" className="text-right">
              {t("features.dialogs.create.keyLabel")}
            </Label>
            <Input
              id="key"
              value={newFeatureKey}
              onChange={(e) => setNewFeatureKey(e.target.value)}
              placeholder={t("features.dialogs.create.placeholders.key")}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="active" className="text-right">
              {t("features.dialogs.create.activeLabel")}
            </Label>
            <div className="col-span-3">
              <Switch
                id="active"
                checked={newFeatureActive}
                onCheckedChange={setNewFeatureActive}
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
                  <Label htmlFor="en-name">
                    {t("features.dialogs.create.nameLabel")}
                  </Label>
                  <Input
                    id="en-name"
                    value={newTranslations.en.name}
                    onChange={(e) =>
                      setNewTranslations({
                        ...newTranslations,
                        en: { ...newTranslations.en, name: e.target.value },
                      })
                    }
                    placeholder={t(
                      "features.dialogs.create.placeholders.enName",
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="en-desc">
                    {t("features.dialogs.create.descLabel")}
                  </Label>
                  <Textarea
                    id="en-desc"
                    value={newTranslations.en.description}
                    onChange={(e) =>
                      setNewTranslations({
                        ...newTranslations,
                        en: {
                          ...newTranslations.en,
                          description: e.target.value,
                        },
                      })
                    }
                    placeholder={t(
                      "features.dialogs.create.placeholders.enDesc",
                    )}
                    rows={3}
                  />
                </div>
              </TabsContent>
              <TabsContent value="vi" className="space-y-4">
                <div>
                  <Label htmlFor="vi-name">
                    {t("features.dialogs.create.nameLabel")}
                  </Label>
                  <Input
                    id="vi-name"
                    value={newTranslations.vi.name}
                    onChange={(e) =>
                      setNewTranslations({
                        ...newTranslations,
                        vi: { ...newTranslations.vi, name: e.target.value },
                      })
                    }
                    placeholder={t(
                      "features.dialogs.create.placeholders.viName",
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="vi-desc">
                    {t("features.dialogs.create.descLabel")}
                  </Label>
                  <Textarea
                    id="vi-desc"
                    value={newTranslations.vi.description}
                    onChange={(e) =>
                      setNewTranslations({
                        ...newTranslations,
                        vi: {
                          ...newTranslations.vi,
                          description: e.target.value,
                        },
                      })
                    }
                    placeholder={t(
                      "features.dialogs.create.placeholders.viDesc",
                    )}
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
          <Button onClick={handleCreate} disabled={isSaving}>
            {isSaving
              ? t("features.dialogs.create.creatingButton")
              : t("features.dialogs.create.createButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
