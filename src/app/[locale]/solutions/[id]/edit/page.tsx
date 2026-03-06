"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from "@/components/ui/multi-select";
import { SolutionsService } from "@/services/solutions-service";
import { useAppSelector } from "@/store/hooks";
import { useToast } from "@/components/providers/toast-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdateSolutionDto } from "@/types/solution";
import { Loader2 } from "lucide-react";

const updateSolutionSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  content: z
    .string()
    .min(20, { message: "Content must be at least 20 characters" }),
  tagIds: z.array(z.number()).optional(),
  languageIds: z.array(z.number()).optional(),
  isEditorial: z.boolean().optional(),
});

type UpdateSolutionFormValues = z.infer<typeof updateSolutionSchema>;

interface EditSolutionPageProps {
  params: Promise<{
    locale: string;
    id: string; // solutionId
  }>;
}

export default function EditSolutionPage({ params }: EditSolutionPageProps) {
  const { id: solutionIdStr } = React.use(params);
  const solutionId = parseInt(solutionIdStr, 10);
  const t = useTranslations("CreateSolutionPage"); // Reusing translations for now
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [problemId, setProblemId] = useState<number | null>(null);

  const { tags: availableTags, languages: availableLanguages } = useAppSelector(
    (state) => state.metadata,
  );

  const tagOptions = availableTags.map((tag) => ({
    label: tag.name,
    value: tag.id.toString(),
  }));

  const languageOptions = availableLanguages.map((lang) => ({
    label: lang.name,
    value: lang.id.toString(),
  }));

  const form = useForm<UpdateSolutionFormValues>({
    resolver: zodResolver(updateSolutionSchema),
    defaultValues: {
      title: "",
      content: "",
      tagIds: [],
      languageIds: [],
      isEditorial: false,
    },
  });

  useEffect(() => {
    const fetchSolution = async () => {
      try {
        const solution = await SolutionsService.getSolution(solutionId);
        setProblemId(solution.problemId);
        form.reset({
          title: solution.title,
          content: solution.content,
          tagIds: solution.tags?.map((t) => t.id) || [],
          languageIds: solution.languageIds || [],
          isEditorial: solution.isEditorial || false,
        });
      } catch (error) {
        toast.error("Failed to fetch solution details");
        router.push("/solutions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolution();
  }, [solutionId, form, toast, router]);

  const onSubmit = async (data: UpdateSolutionFormValues) => {
    setIsSubmitting(true);
    try {
      const solutionData: UpdateSolutionDto = {
        title: data.title,
        content: data.content,
        isEditorial: data.isEditorial,
        tagIds: data.tagIds,
        languageIds: data.languageIds,
      };

      await SolutionsService.updateAdmin(solutionId, solutionData);
      toast.success(t("successMessageEdit"));

      // Redirect back to solutions page, filtered by this problem if we know it
      if (problemId) {
        router.push(`/solutions?problemId=${problemId}`);
      } else {
        router.push("/solutions");
      }
    } catch (error) {
      toast.error(t("errorMessageEdit"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("editTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("solutionTitle")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("titlePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("content")}</FormLabel>
                    <FormControl>
                      <MarkdownEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t("contentPlaceholder")}
                        minHeight="min-h-[400px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="tagIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("tags")}</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={tagOptions}
                          selectedValues={(field.value || []).map(String)}
                          onChange={(values) =>
                            field.onChange(values.map(Number))
                          }
                          placeholder={t("selectTags")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="languageIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("languages")}</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={languageOptions}
                          selectedValues={(field.value || []).map(String)}
                          onChange={(values) =>
                            field.onChange(values.map(Number))
                          }
                          placeholder={t("selectLanguages")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isEditorial"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        {t("isEditorial")}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("submitting") : t("submit")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
