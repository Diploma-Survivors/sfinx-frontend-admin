import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "./markdown-renderer";
import { Eye, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
  className,
  minHeight = "min-h-[300px]",
}: MarkdownEditorProps) {
  const t = useTranslations("MarkdownEditor");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Tabs defaultValue="write" className="w-full">
        <div className="flex items-center justify-between pb-2">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="write" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t("write")}
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {t("preview")}
            </TabsTrigger>
          </TabsList>
          <div className="text-xs text-muted-foreground hidden sm:block">
            {t("supportsMarkdown")}
          </div>
        </div>

        <TabsContent value="write" className="mt-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "font-mono text-sm leading-relaxed resize-y",
              minHeight,
            )}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div
            className={cn(
              "rounded-md border bg-background px-4 py-3 overflow-y-auto",
              minHeight,
            )}
          >
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="text-muted-foreground text-sm italic">
                {t("nothingToPreview")}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
