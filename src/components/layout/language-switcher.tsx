import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function LanguageSwitcher() {
    const t = useTranslations('LocaleSwitcher');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const onSelectChange = (nextLocale: string) => {
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <Select value={locale} onValueChange={onSelectChange} disabled={isPending}>
            <SelectTrigger className="w-[140px] bg-white dark:bg-slate-950">
                <SelectValue placeholder={t('label')} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="en">{t('en')}</SelectItem>
                <SelectItem value="vi">{t('vi')}</SelectItem>
            </SelectContent>
        </Select>
    );
}
