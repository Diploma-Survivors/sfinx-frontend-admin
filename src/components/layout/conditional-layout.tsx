'use client';

import Breadcrumbs from '@/components/layout/breadcrumbs';
import Sidebar from '@/components/layout/sidebar';
import { useApp } from '@/contexts/app-context';
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import LanguageSwitcher from '@/components/layout/language-switcher';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import GlobalLoader from '@/components/ui/global-loader';
import { NotificationBell } from '@/components/notifications/notification-bell';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobile } = useSidebar();
  const { clearUserData, user } = useApp();
  const locale = useLocale();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    clearUserData();
    await signOut({
      redirect: false,
    });
    window.location.href = `/${locale}/login`;
  };

  if (isLoggingOut) {
    return <GlobalLoader />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar onLogout={handleLogout} />
      <main
        className={cn(
          'transition-all duration-300 ease-in-out min-h-screen',
          !isMobile && (isOpen ? 'pl-[240px]' : 'pl-[80px]')
        )}
      >
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-1">
            <Breadcrumbs />
            <div className="flex items-center gap-2">
              <NotificationBell />
              <LanguageSwitcher />
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { shouldHideNavigation, isLoading } = useApp();

  if (isLoading) {
    return <GlobalLoader />;
  }

  if (shouldHideNavigation) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
