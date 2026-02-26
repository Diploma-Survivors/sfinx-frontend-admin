import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContestStatus } from "@/types/contest";
import MarkdownEditor from "@/components/markdown-editor/markdown-editor";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { ContestFormValues } from "./schema";

interface GeneralInfoSectionProps {
  register: UseFormRegister<ContestFormValues>;
  control: Control<ContestFormValues>;
  errors: FieldErrors<ContestFormValues>;
}

export function GeneralInfoSection({
  register,
  control,
  errors,
}: GeneralInfoSectionProps) {
  const t = useTranslations("CreateContestPage.form.generalInfo");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t("nameLabel")}</Label>
          <Input
            id="title"
            placeholder={t("namePlaceholder")}
            {...register("title")}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{t("descriptionLabel")}</Label>
          <div className="h-[400px]">
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <MarkdownEditor
                  content={field.value}
                  onChange={field.onChange}
                  className={cn(
                    "h-full",
                    errors.description && "border-red-500",
                  )}
                />
              )}
            />
          </div>
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">{t("startTimeLabel")}</Label>
            <Input
              id="startTime"
              type="datetime-local"
              {...register("startTime")}
              className={errors.startTime ? "border-red-500" : ""}
            />
            {errors.startTime && (
              <p className="text-sm text-red-500">{errors.startTime.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="durationMinutes">{t("durationLabel")}</Label>
            <Input
              id="durationMinutes"
              type="number"
              min="1"
              {...register("durationMinutes")}
              className={errors.durationMinutes ? "border-red-500" : ""}
            />
            {errors.durationMinutes && (
              <p className="text-sm text-red-500">
                {errors.durationMinutes.message}
              </p>
            )}
            {/* Display calculated end time */}
            {(() => {
              const startTime =
                control._formValues.startTime ||
                control._defaultValues.startTime;
              const duration =
                control._formValues.durationMinutes ||
                control._defaultValues.durationMinutes;
              if (startTime && duration) {
                const start = new Date(startTime);
                if (!isNaN(start.getTime())) {
                  const end = new Date(start.getTime() + duration * 60000);
                  return (
                    <p className="text-sm text-slate-500 mt-1">
                      {t("endsAt", { time: end.toLocaleString() })}
                    </p>
                  );
                }
              }
              return null;
            })()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t("statusLabel")}</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    className={errors.status ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder={t("statusPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ContestStatus.DRAFT}>
                      {t("statusDraft")}
                    </SelectItem>
                    <SelectItem value={ContestStatus.SCHEDULED}>
                      {t("statusScheduled")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
