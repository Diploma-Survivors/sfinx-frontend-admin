import { ShieldAlert, Home } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function UnauthorizedPage() {
    const t = useTranslations('Unauthorized');

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-background text-foreground overflow-hidden p-4">
            {/* Ambient glow background */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/8 blur-[100px]" />
                <div className="absolute left-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-destructive/5 blur-[80px]" />
            </div>

            <div className="container flex max-w-[48rem] flex-col items-center gap-8 text-center">
                {/* Shield icon with pulsing rings */}
                <div className="animate-in fade-in zoom-in duration-700 relative flex items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive/20 opacity-60" />
                    <div className="relative rounded-full border border-destructive/20 bg-destructive/10 p-7 shadow-[0_0_40px_-5px_hsl(var(--destructive)/0.3)]">
                        <ShieldAlert className="h-14 w-14 text-destructive" />
                    </div>
                </div>

                {/* 403 */}
                <h1 className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both font-heading text-8xl font-black tracking-tight text-destructive duration-500 [animation-delay:150ms] sm:text-9xl">
                    {t('heading')}
                </h1>

                {/* Divider */}
                <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 [animation-delay:300ms] flex items-center gap-4 w-full max-w-xs">
                    <div className="h-px flex-1 bg-border" />
                    <div className="h-1.5 w-1.5 rounded-full bg-destructive/60" />
                    <div className="h-px flex-1 bg-border" />
                </div>

                {/* Subheading */}
                <h2 className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both font-heading text-2xl font-bold duration-500 [animation-delay:300ms] sm:text-3xl">
                    {t('subheading')}
                </h2>

                {/* Message */}
                <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both max-w-[38rem] leading-relaxed text-muted-foreground duration-500 [animation-delay:450ms] sm:text-lg">
                    {t('message')}
                </p>

                {/* Actions */}
                <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both flex flex-wrap items-center justify-center gap-3 duration-500 [animation-delay:600ms]">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-lg bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground shadow-md transition-all hover:-translate-y-0.5 hover:bg-destructive/90 hover:shadow-[0_6px_20px_-4px_hsl(var(--destructive)/0.5)] active:translate-y-0"
                    >
                        <Home className="h-4 w-4" />
                        {t('goHome')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
