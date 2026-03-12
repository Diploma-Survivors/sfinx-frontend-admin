"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/providers/toast-provider";

import {
  StudyPlanDifficulty,
  UpdateStudyPlanDto,
  StudyPlanDetailResponseDto,
  AdminStudyPlanDetailResponseDto,
  StudyPlanTranslationDto,
  StudyPlanStatus,
} from "@/types/study-plan";
import { studyPlanService } from "@/services/study-plan-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiSelect } from "@/components/ui/multi-select";
import useTags from "@/hooks/use-tags";
import useTopics from "@/hooks/use-topics";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectStudyPlansModal } from "./select-study-plans-modal";
import { X } from "lucide-react";
import Image from "next/image";
import { AdminStudyPlanResponseDto } from "@/types/study-plan";

interface StudyPlanEditFormProps {
  id: number;
}

export default function StudyPlanEditForm({ id }: StudyPlanEditFormProps) {
  const t = useTranslations("StudyPlanForm");
  const tPage = useTranslations("StudyPlansPage");
  const router = useRouter();
  const toast = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [initialData, setInitialData] =
    useState<AdminStudyPlanDetailResponseDto | null>(null);
  const [selectedSimilarPlans, setSelectedSimilarPlans] = useState<AdminStudyPlanResponseDto[]>([]);

  const { tags } = useTags({ fetchAll: true });
  const { topics } = useTopics({ fetchAll: true });

  const formSchema = z.object({
    slug: z
      .string()
      .min(1, t("validation.slugReq"))
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, t("validation.slugInvalid")),
    difficulty: z.nativeEnum(StudyPlanDifficulty),
    status: z.nativeEnum(StudyPlanStatus).optional(),
    isPremium: z.boolean(),
    translations: z.array(
      z.object({
        languageCode: z.string(),
        name: z.string().min(1, t("validation.nameReq")),
        description: z
          .string()
          .min(3, t("validation.descriptionMinLen").toString()),
      }),
    ),
    tagIds: z.array(z.number()).min(1, t("validation.tagsReq")),
    topicIds: z.array(z.number()).min(1, t("validation.topicsReq")),
    similarPlanIds: z.array(z.number()),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
      difficulty: StudyPlanDifficulty.BEGINNER,
      isPremium: false,
      translations: [
        { languageCode: "en", name: "", description: "" },
        { languageCode: "vi", name: "", description: "" },
      ],
      tagIds: [],
      topicIds: [],
      similarPlanIds: [],
    },
  });

  useEffect(() => {
    const fetchStudyPlan = async () => {
      try {
        setIsLoading(true);
        const response = await studyPlanService.getStudyPlanById(id);
        const data = response.data;
        setInitialData(data);

        // Prepare translations
        const validTranslations: StudyPlanTranslationDto[] = [
          { languageCode: "en", name: "", description: "" },
          { languageCode: "vi", name: "", description: "" },
        ];

        data.translations?.forEach((t) => {
          const index = validTranslations.findIndex(
            (vt) => vt.languageCode === t.languageCode,
          );
          if (index !== -1) {
            validTranslations[index] = { ...validTranslations[index], ...t };
          } else {
            validTranslations.push(t);
          }
        });

        form.reset({
          slug: data.slug,
          difficulty: data.difficulty,
          status: data.status,
          isPremium: data.isPremium,
          translations: validTranslations.map((vt) => ({
            ...vt,
            description: vt.description ?? "",
          })),
          tagIds: data.tags?.map((t) => t.id) || [],
          topicIds: data.topics?.map((t) => t.id) || [],
          similarPlanIds: data.similarPlanIds || [],
        });

        // Optionally fetch similar plans to display their names
        if (data.similarPlanIds && data.similarPlanIds.length > 0) {
          // Since we don't have a getManyByIds, we can fetch all and filter or fetch individually
          // But for now, let's just use what we can. 
          // Re-using the getStudyPlans with IDs filter if possible, otherwise individual fetches.
          const plans = await Promise.all(
            data.similarPlanIds.map(id => studyPlanService.getStudyPlanById(id).then(res => res.data))
          );
          setSelectedSimilarPlans(plans);
        }
      } catch (error) {
        toast.error(tPage("fetchError"));
        router.push("/study-plans");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyPlan();
  }, [id, form, router, toast]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const data: UpdateStudyPlanDto = {
        slug: values.slug !== initialData?.slug ? values.slug : undefined,
        difficulty: values.difficulty,
        status: values.status,
        isPremium: values.isPremium,
        translations: values.translations.map((t) => ({
          languageCode: t.languageCode,
          name: t.name,
          description: t.description || "",
        })),
        tagIds: values.tagIds,
        topicIds: values.topicIds,
        similarPlanIds: values.similarPlanIds,
      };

      await studyPlanService.updateStudyPlan(id, data, coverImage || undefined);

      toast.success(t("updateSuccess"));
      router.push("/study-plans");
    } catch (error) {
      toast.error(t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = () => {
    toast.error(t("validation.fixErrors"));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-8">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const errors = form.formState.errors;
  const hasEnError = !!errors.translations?.[0];
  const hasViError = !!errors.translations?.[1];

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2">
                {t("generalInfo")}
              </h3>

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("slugLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("slugPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("difficultyLabel")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("difficultyPlaceholder")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={StudyPlanDifficulty.BEGINNER}>
                            {t("difficultyOptions.beginner")}
                          </SelectItem>
                          <SelectItem value={StudyPlanDifficulty.INTERMEDIATE}>
                            {t("difficultyOptions.intermediate")}
                          </SelectItem>
                          <SelectItem value={StudyPlanDifficulty.ADVANCED}>
                            {t("difficultyOptions.advanced")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isPremium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("premiumLabel")}
                      </FormLabel>
                      <FormDescription>
                        {t("premiumDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>{t("coverImageLabel")}</FormLabel>
                {initialData?.coverImageUrl && !coverImage && (
                  <div className="mb-2">
                    <p className="text-sm text-slate-500 mb-1">
                      {t("currentCoverImage")}
                    </p>
                    <div className="relative w-full h-32 rounded-md overflow-hidden border">
                      <Image
                        src={initialData.coverImageUrl}
                        alt="Cover Image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-sm text-slate-500">
                  {t("coverImageDescription")} {t("coverImageNote")}
                </p>
                {coverImage && (
                  <p className="text-sm text-green-600 mt-2">
                    {t("newSelected", { name: coverImage.name })}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold border-b pb-2">
                {t("classificationAndLocalization")}
              </h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="tagIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("tagsLabel")}</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={
                            tags?.map((t: any) => ({
                              label: t.name,
                              value: t.id.toString(),
                            })) || []
                          }
                          selectedValues={field.value?.map(String) || []}
                          onChange={(vals) => field.onChange(vals.map(Number))}
                          placeholder={t("tagsPlaceholder")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topicIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("topicsLabel")}</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={
                            topics?.map((t: any) => ({
                              label: t.name,
                              value: t.id.toString(),
                            })) || []
                          }
                          selectedValues={field.value?.map(String) || []}
                          onChange={(vals) => field.onChange(vals.map(Number))}
                          placeholder={t("topicsPlaceholder")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4">
                <h4 className="font-medium mb-4">{t("translationsLabel")}</h4>
                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger 
                      value="en"
                      className={hasEnError ? "text-red-500 data-[state=active]:text-red-600 border-red-200 bg-red-50/50" : ""}
                    >
                      {t("enTab")}
                      {hasEnError && <span className="ml-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="vi"
                      className={hasViError ? "text-red-500 data-[state=active]:text-red-600 border-red-200 bg-red-50/50" : ""}
                    >
                      {t("viTab")}
                      {hasViError && <span className="ml-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                    </TabsTrigger>
                  </TabsList>

                  {/* English Translation */}
                  <TabsContent value="en" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="translations.0.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("nameLabel")} (EN)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("namePlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="translations.0.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("descriptionLabel")} (EN)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="English description"
                              className="min-h-[120px]"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* Vietnamese Translation */}
                  <TabsContent value="vi" className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="translations.1.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("nameLabel")} (VI)</FormLabel>
                          <FormControl>
                            <Input placeholder="Tên tiếng Việt" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="translations.1.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("descriptionLabel")} (VI)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Mô tả tiếng Việt"
                              className="min-h-[120px]"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="similarPlanIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("similarProblemsLabel")}</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <SelectStudyPlansModal
                            title={t("selectSimilarProblems")}
                            selectedPlanIds={field.value}
                            excludePlanId={id}
                            onPlansSelect={(plans) => {
                              const newIds = [...new Set([...field.value, ...plans.map(p => p.id)])];
                              field.onChange(newIds);
                              
                              // Update local display state
                              const newPlans = [...selectedSimilarPlans];
                              plans.forEach(p => {
                                if (!newPlans.find(existing => existing.id === p.id)) {
                                  newPlans.push(p);
                                }
                              });
                              setSelectedSimilarPlans(newPlans);
                            }}
                          />
                          
                          {selectedSimilarPlans.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {selectedSimilarPlans.map((plan) => (
                                <div
                                  key={plan.id}
                                  className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-sm border border-slate-200 dark:border-slate-700 shadow-sm"
                                >
                                  <span className="font-medium">#{plan.id}</span>
                                  <span className="max-w-[150px] truncate">{plan.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newIds = field.value.filter(v => v !== plan.id);
                                      field.onChange(newIds);
                                      setSelectedSimilarPlans(prev => prev.filter(p => p.id !== plan.id));
                                    }}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("saving") : t("submitEdit")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
