"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DiscussService } from "@/services/discuss-service";
import { Post, Tag } from "@/types/discuss";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "next-intl";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { ArrowLeft, Save } from "lucide-react";

interface DiscussFormProps {
  post?: Post;
  isEditing?: boolean;
}

export function DiscussForm({ post, isEditing = false }: DiscussFormProps) {
  const t = useTranslations("Discuss.Form");
  const router = useRouter();
  const { error, success } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

  const [formData, setFormData] = useState({
    title: post?.title || "",
    content: post?.content || "",
    tagIds: post?.tags.map((t) => t.id.toString()) || [],
  });

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const result = await DiscussService.getTags();
        setTags(result.data || []);
      } catch (err) {
        console.error("Failed to load tags", err);
        error(t("messages.loadTagsError"));
      }
    };
    fetchTags();
  }, [error, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditing && post) {
        await DiscussService.updatePost(post.id, {
          title: formData.title,
          content: formData.content,
          tagIds: formData.tagIds.map(Number),
        });
        success(t("messages.updateSuccess"));
        router.push(`/discussions/${post.id}`);
      } else {
        const newPost = await DiscussService.createPost({
          title: formData.title,
          content: formData.content,
          tagIds: formData.tagIds.map(Number),
        });
        success(t("messages.createSuccess"));
        router.push(`/discussions/${newPost.id}`);
      }
      router.refresh();
    } catch (err) {
      error(isEditing ? t("messages.updateError") : t("messages.createError"));
    } finally {
      setIsLoading(false);
    }
  };

  const tagOptions: Option[] = tags.map((tag) => ({
    label: tag.name,
    value: tag.id.toString(),
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {isEditing ? t("editTitle") : t("createTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing ? t("editDescription") : t("createDescription")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("buttons.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              t("buttons.saving")
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? t("buttons.update") : t("buttons.create")}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-base font-medium">
              {t("labels.title")}
            </Label>
            <Input
              id="title"
              placeholder={t("placeholders.title")}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="text-lg py-6"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags" className="text-base font-medium">
              {t("labels.tags")}
            </Label>
            <MultiSelect
              options={tagOptions}
              selectedValues={formData.tagIds}
              onChange={(values) =>
                setFormData({ ...formData, tagIds: values })
              }
              placeholder={t("placeholders.tags") || "Select tags..."}
              searchPlaceholder={
                t("placeholders.tagsSearch") || "Search tags..."
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {t("helpText.tagsSelection")}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content" className="text-base font-medium">
              {t("labels.content")}
            </Label>
            <MarkdownEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder={t("placeholders.content")}
              minHeight="min-h-[400px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
