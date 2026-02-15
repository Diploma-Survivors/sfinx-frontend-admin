"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/app-context";
import { useToast } from "@/components/providers/toast-provider";
import { Code, ImageIcon, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  submitLabel?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
  initialValue?: string;
  className?: string;
  showAvatar?: boolean;
}

export function CommentForm({
  onSubmit,
  placeholder,
  submitLabel,
  onCancel,
  autoFocus = false,
  initialValue = "",
  className,
  showAvatar = true,
}: CommentFormProps) {
  const t = useTranslations("Discuss.Comments");
  // Teacher frontend uses next-auth session primarily, but let's check both
  const { data: session } = useSession();
  const { user: appUser } = useApp();
  const { error: toastError } = useToast();

  // Fallback defaults using t() if props not provided
  const finalPlaceholder = placeholder || t("placeholders.typeComment");
  const finalSubmitLabel = submitLabel || t("actions.post");

  // Fallback to session user if app context user is not available
  const user =
    appUser ||
    (session?.user
      ? ({
          id: session.user.id,
          fullName: session.user.name || "Anonymous",
          username: session.user.name || "Anonymous",
          avatarUrl: session.user.image || undefined,
          email: session.user.email || "",
          // Cast to any to avoid strict type mismatch with UserProfile if it has other required fields
        } as any)
      : null);

  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent("");
      if (onCancel) onCancel();
    } catch (error) {
      toastError(t("messages.postError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-muted/30 p-4 rounded-lg text-center text-sm text-muted-foreground border border-dashed border-border/50">
        {t.rich("loginToJoin", {
          login: (chunks) => (
            <span className="font-semibold text-primary">{chunks}</span>
          ),
        })}
      </div>
    );
  }

  const getDisplayName = () => user.fullName || user.username || "Anonymous";
  const getAvatarUrl = () => user.avatarUrl || user.image;

  return (
    <div className={cn("flex gap-3", className)}>
      {showAvatar && (
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border border-border/50 mt-0.5">
          <AvatarImage src={getAvatarUrl()} alt={getDisplayName()} />
          <AvatarFallback className="bg-muted text-xs sm:text-sm font-medium text-muted-foreground">
            {getDisplayName().charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex-1 space-y-2">
        <div className="relative rounded-xl border border-border bg-background focus-within:ring-1 focus-within:ring-ring focus-within:border-primary/50 transition-all shadow-sm">
          <Textarea
            placeholder={finalPlaceholder}
            className="min-h-[100px] resize-y bg-transparent border-none focus-visible:ring-0 px-4 py-3 text-sm placeholder:text-muted-foreground/60 leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus={autoFocus}
            disabled={isSubmitting}
          />

          {/* Footer with Tools & Button */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-border/50 bg-muted/20 rounded-b-xl">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md"
              >
                <Code className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="h-7 px-3 text-muted-foreground hover:text-foreground"
                >
                  {t("actions.cancel")}
                </Button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                size="sm"
                className={cn(
                  "h-7 px-4 shadow-sm transition-all",
                  !content.trim() && "opacity-50 cursor-not-allowed",
                )}
              >
                {isSubmitting ? t("actions.posting") : finalSubmitLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
