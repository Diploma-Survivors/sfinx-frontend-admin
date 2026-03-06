"use client";

import React, { Suspense, useState } from "react";
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
import { CreateSolutionDto } from "@/types/solution";
import { Problem, ProblemEndpointType } from "@/types/problems";
import { useSearchParams } from "next/navigation";
import useProblems from "@/hooks/use-problems";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check, Loader2 } from "lucide-react";

const createSolutionSchema = z.object({
  problemId: z.number().min(1, { message: "Please select a problem" }),
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  content: z
    .string()
    .min(20, { message: "Content must be at least 20 characters" }),
  tagIds: z.array(z.number()).optional(),
  languageIds: z.array(z.number()).optional(),
  isEditorial: z.boolean(),
});

type CreateSolutionFormValues = z.infer<typeof createSolutionSchema>;

function CreateSolutionPageContent() {
  const searchParams = useSearchParams();
  const initialProblemIdStr = searchParams.get("problemId");
  const t = useTranslations("CreateSolutionPage");
  const router = useRouter();
  const toast = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const initialProblemId = initialProblemIdStr
    ? parseInt(initialProblemIdStr, 10)
    : null;

  // Dropdown states
  const [problemSearch, setProblemSearch] = useState("");
  const [accumulatedProblems, setAccumulatedProblems] = useState<Problem[]>([]);
  const [isProblemDropdownOpen, setIsProblemDropdownOpen] = useState(false);
  const problemObserverTarget = React.useRef<HTMLDivElement>(null);

  const {
    problems,
    meta: problemsMeta,
    isLoading: isProblemsLoading,
    handleKeywordChange: handleProblemKeywordChange,
    handlePageChange: handleProblemPageChange,
  } = useProblems(ProblemEndpointType.PROBLEM_MANAGEMENT);

  // Sync problems for infinite scroll
  React.useEffect(() => {
    if (problemsMeta?.page === 1) {
      setAccumulatedProblems(problems);
    } else if (problems.length > 0) {
      setAccumulatedProblems((prev) => {
        const newProblems = problems.filter(
          (p) => !prev.some((existing) => existing.id === p.id),
        );
        return [...prev, ...newProblems];
      });
    }
  }, [problems, problemsMeta?.page]);

  // Handle problem search text change
  React.useEffect(() => {
    handleProblemKeywordChange(problemSearch);
  }, [problemSearch, handleProblemKeywordChange]);

  // Infinite scroll observer hook
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          problemsMeta?.hasNextPage &&
          !isProblemsLoading
        ) {
          handleProblemPageChange((problemsMeta.page || 1) + 1);
        }
      },
      { threshold: 1.0 },
    );

    if (problemObserverTarget.current) {
      observer.observe(problemObserverTarget.current);
    }

    return () => observer.disconnect();
  }, [
    problemsMeta?.hasNextPage,
    isProblemsLoading,
    handleProblemPageChange,
    problemsMeta?.page,
  ]);

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

  const form = useForm<CreateSolutionFormValues>({
    resolver: zodResolver(createSolutionSchema),
    defaultValues: {
      problemId: initialProblemIdStr
        ? parseInt(initialProblemIdStr, 10)
        : undefined,
      title: "",
      content: "",
      tagIds: [],
      languageIds: [],
      isEditorial: false,
    },
  });

  const onSubmit = async (data: CreateSolutionFormValues) => {
    setIsSubmitting(true);
    try {
      const solutionData: CreateSolutionDto = {
        problemId: data.problemId,
        title: data.title,
        content: data.content,
        isEditorial: data.isEditorial,
        tagIds: data.tagIds,
        languageIds: data.languageIds,
      };

      await SolutionsService.createAdmin(solutionData);
      toast.success(t("successMessage"));
      router.push(`/solutions?problemId=${data.problemId}`);
    } catch (error) {
      toast.error(t("errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="problemId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("selectProblemTitle")}</FormLabel>
                    <DropdownMenu
                      open={isProblemDropdownOpen}
                      onOpenChange={setIsProblemDropdownOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`h-10 border-slate-200 dark:border-slate-700 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer min-w-[200px] justify-between w-full ${!field.value && "text-muted-foreground"}`}
                            onBlur={field.onBlur}
                          >
                            {field.value
                              ? accumulatedProblems.find(
                                  (p) => p.id === field.value,
                                )?.title ||
                                selectedProblem?.title ||
                                t("selectProblemTitle")
                              : t("selectProblemTitle")}
                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-80 overflow-y-auto"
                      >
                        <div className="p-2 sticky top-0 bg-white dark:bg-slate-950 z-10 w-full box-border">
                          <Input
                            placeholder={t("searchProblems")}
                            value={problemSearch}
                            onChange={(e) => setProblemSearch(e.target.value)}
                            className="h-8 text-xs focus-visible:ring-0 w-full"
                          />
                        </div>
                        <DropdownMenuSeparator />
                        {accumulatedProblems.length === 0 &&
                        !isProblemsLoading ? (
                          <div className="p-2 text-sm text-slate-500">
                            {t("noProblemFound")}
                          </div>
                        ) : (
                          accumulatedProblems.map((problem) => (
                            <DropdownMenuItem
                              key={problem.id}
                              className="flex items-center justify-between px-2 py-2 cursor-pointer"
                              onSelect={() => {
                                setSelectedProblem(problem);
                                field.onChange(problem.id);
                                form.trigger("problemId");
                                setIsProblemDropdownOpen(false);
                              }}
                            >
                              <span className="text-sm truncate mr-2">
                                {problem.title}
                              </span>
                              {field.value === problem.id && (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                            </DropdownMenuItem>
                          ))
                        )}
                        {isProblemsLoading && (
                          <div className="flex justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        )}
                        <div ref={problemObserverTarget} className="h-1" />
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

export default function CreateSolutionPage() {
  return (
    <Suspense>
      <CreateSolutionPageContent />
    </Suspense>
  );
}
