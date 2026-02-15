"use client";

import React, { useState } from "react";
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
import { MarkdownEditor } from "@/components/ui/markdown-editor"; // Correct import based on search
import { SolutionsService } from "@/services/solutions-service";
import { useToast } from "@/components/providers/toast-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming Card components exist
import { CreateSolutionDto } from "@/types/solution";

const createSolutionSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  content: z
    .string()
    .min(20, { message: "Content must be at least 20 characters" }),
});

type CreateSolutionFormValues = z.infer<typeof createSolutionSchema>;

interface CreateSolutionPageProps {
  params: Promise<{
    locale: string;
    id: string; // problemId
  }>;
}

export default function CreateSolutionPage({
  params,
}: CreateSolutionPageProps) {
  const { id: problemIdStr } = React.use(params);
  const problemId = parseInt(problemIdStr, 10);
  const t = useTranslations("CreateSolutionPage");
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateSolutionFormValues>({
    resolver: zodResolver(createSolutionSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = async (data: CreateSolutionFormValues) => {
    setIsSubmitting(true);
    try {
      const solutionData: CreateSolutionDto = {
        problemId,
        title: data.title,
        content: data.content,
        // tags: [], // TODO: Add tag selection
        // languageIds: [], // TODO: Add language selection if needed
      };

      await SolutionsService.create(solutionData);
      toast.success(t("successMessage"));
      router.push(`/solutions?problemId=${problemId}`);
    } catch (error) {
      toast.error(t("errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
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
