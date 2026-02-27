import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTransition, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/contexts/app-context";
import clientApi from "@/lib/apis/axios-client";
import { toastService } from "@/services/toasts-service";

export default function LanguageSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { user } = useApp();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user?.preferredLanguage && !isInitialized) {
      setIsInitialized(true);
      if (
        user.preferredLanguage !== locale &&
        ["en", "vi"].includes(user.preferredLanguage)
      ) {
        startTransition(() => {
          router.replace(pathname, { locale: user.preferredLanguage });
        });
      }
    }
  }, [user?.preferredLanguage, locale, pathname, router, isInitialized]);

  const onSelectChange = async (nextLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });

    if (user) {
      try {
        await clientApi.patch("/auth/me", {
          preferredLanguage: nextLocale,
        });
      } catch (error) {
        console.error("Failed to update language", error);
        toastService.error(
          t("updateFailed") || "Failed to update preferred language",
        );
      }
    }
  };

  return (
    <Select value={locale} onValueChange={onSelectChange} disabled={isPending}>
      <SelectTrigger className="w-[140px] bg-white dark:bg-slate-950">
        <SelectValue placeholder={t("label")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t("en")}</SelectItem>
        <SelectItem value="vi">{t("vi")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
