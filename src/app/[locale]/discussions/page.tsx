import { DiscussList } from "@/components/discuss/discuss-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function DiscussionsPage() {
  const t = useTranslations("Discuss.List.header");

  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("description")}</p>
        </div>
        <Button asChild>
          <Link href="/discussions/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("newDiscussion")}
          </Link>
        </Button>
      </div>

      <DiscussList />
    </div>
  );
}
