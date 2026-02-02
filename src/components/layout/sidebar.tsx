'use client';

import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/app-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Bot,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Code,
  FileCode,
  Flag,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorPlay,
  Plus,
  PlusCircle,
  Settings,
  Shield,
  Sparkles,
  Tag,
  Trophy,
  Users,
  X,
  CreditCard,
  BarChart3,
} from 'lucide-react';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { UserSettingsDialog } from '@/components/user/user-settings-dialog';
import { PermissionEnum } from '@/types/permission';

interface SideBarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SideBarProps) {
  const { isOpen, setIsOpen, toggle, isMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Sidebar');
  const tCommon = useTranslations('General');
  const tSub = useTranslations('Subscription');

  const { user, hasPermission } = useApp();

  interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    permissions?: PermissionEnum[];
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      title: t('overview'),
      items: [{ name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard }],
    },
    {
      title: t('problemManagement'),
      items: [
        {
          name: t('problemList'),
          href: '/problems',
          icon: FileCode,
          permissions: [PermissionEnum.PROBLEM_READ]
        },
        {
          name: t('createNewProblem'),
          href: '/problems/create',
          icon: PlusCircle,
          permissions: [PermissionEnum.PROBLEM_CREATE]
        },
        {
          name: t('manageTagsTopics'),
          href: '/tags',
          icon: Tag,
          permissions: [PermissionEnum.PROBLEM_UPDATE] // Assumption: Editors can manage tags
        },
      ],
    },
    {
      title: t('contestManagement'),
      items: [
        {
          name: t('contestList'),
          href: '/contests',
          icon: Trophy,
          permissions: [PermissionEnum.CONTEST_READ]
        },
        {
          name: t('createNewContest'),
          href: '/contests/create',
          icon: Plus,
          permissions: [PermissionEnum.CONTEST_CREATE]
        },
      ],
    },
    {
      title: t('submissionManagement'),
      items: [
        {
          name: t('manageSubmissions'),
          href: '/submissions',
          icon: CheckSquare,
          permissions: [PermissionEnum.SUBMISSION_READ]
        },
        {
          name: t('programmingLanguages'),
          href: '/programing-language',
          icon: Code,
          permissions: [PermissionEnum.LANGUAGE_READ]
        },
      ],
    },
    {
      title: t('userManagement'),
      items: [
        {
          name: t('userList'),
          href: '/users',
          icon: Users,
          permissions: [PermissionEnum.USER_READ]
        },
        {
          name: t('feedbackReports'),
          href: '/reports',
          icon: Flag,
          permissions: [PermissionEnum.COMMENT_REPORT_READ]
        },
        {
          name: t('rolesAndPermissions'),
          href: '/roles',
          icon: Shield,
          permissions: [PermissionEnum.ADMIN_ROLES]
        },
      ],
    },
    {
      // Subscription Management Section
      title: tSub('title'),
      items: [
        {
          name: tSub('plans'),
          href: '/subscriptions/plans',
          icon: CreditCard,
          permissions: [PermissionEnum.ADMIN_ACCESS]
        },
        {
          name: tSub('features'),
          href: '/subscriptions/features',
          icon: Sparkles,
          permissions: [PermissionEnum.ADMIN_ACCESS]
        },
        {
          name: tSub('transactions'),
          href: '/subscriptions/transactions',
          icon: FileCode,
          permissions: [PermissionEnum.ADMIN_ACCESS]
        },
        {
          name: tSub('statistics'),
          href: '/subscriptions/statistics',
          icon: BarChart3,
          permissions: [PermissionEnum.ADMIN_ACCESS]
        },
      ],
    },
    {
      title: t('systemAi'),
      items: [
        {
          name: t('manageAiPrompts'),
          href: '/ai-prompts',
          icon: Sparkles,
          permissions: [PermissionEnum.ADMIN_ACCESS]
        },
        {
          name: t('generalSettings'),
          href: '/settings',
          icon: Settings,
          permissions: [PermissionEnum.ADMIN_ACCESS]
        },
      ],
    },
  ];

  const filteredNavSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.permissions || item.permissions.length === 0 || item.permissions.some(hasPermission)
      ),
    }))
    .filter((section) => section.items.length > 0);

  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '80px' },
    mobileOpen: { width: '240px', x: 0 },
    mobileClosed: { width: '240px', x: '-100%' },
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.aside
        initial={isMobile ? 'mobileClosed' : 'expanded'}
        animate={
          isMobile
            ? isOpen
              ? 'mobileOpen'
              : 'mobileClosed'
            : isOpen
              ? 'expanded'
              : 'collapsed'
        }
        variants={sidebarVariants}
        transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
        className={cn(
          'fixed top-0 left-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-xl',
          isMobile ? 'w-64' : ''
        )}
      >
        {/* Header / Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 shrink-0 justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <span className="text-xl font-bold tracking-tight text-primary">
              {tCommon('app_name')}
            </span>
          </Link>



          {/* Desktop Collapse Toggle */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-600"
              onClick={toggle}
            >
              {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </Button>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          {filteredNavSections.map((section, index) => (
            <div key={index}>
              {/* Section Header */}
              <motion.div
                animate={{
                  opacity: isOpen ? 1 : 0,
                  display: isOpen ? 'block' : 'none',
                }}
                className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"
              >
                {section.title}
              </motion.div>

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group',
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'w-5 h-5 min-w-5',
                          isActive
                            ? 'text-primary'
                            : 'text-slate-500 dark:text-slate-500'
                        )}
                      />
                      <motion.span
                        animate={{
                          opacity: isOpen ? 1 : 0,
                          display: isOpen ? 'block' : 'none',
                        }}
                        className="whitespace-nowrap text-sm"
                      >
                        {item.name}
                      </motion.span>

                      {/* Tooltip for collapsed state */}
                      {!isOpen && !isMobile && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div
            className={cn(
              'flex items-center gap-3',
              !isOpen && !isMobile ? 'justify-center' : ''
            )}
          >
            <div className="w-10 h-10 min-w-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
              {user?.fullName?.[0] || user?.username?.[0] || 'U'}
            </div>

            <motion.div
              animate={{
                opacity: isOpen ? 1 : 0,
                width: isOpen ? 'auto' : 0,
                display: isOpen ? 'block' : 'none',
              }}
              className="flex-1 overflow-hidden"
            >
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {user?.fullName || user?.username || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email || t('noEmail')}
              </p>
            </motion.div>

            {isOpen && <UserSettingsDialog />}
          </div>

          <motion.div
            animate={{
              opacity: isOpen ? 1 : 0,
              height: isOpen ? 'auto' : 0,
              marginTop: isOpen ? 12 : 0,
              display: isOpen ? 'block' : 'none',
            }}
          >
            <Button
              variant="outline"
              className="w-full justify-center gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20"
              onClick={onLogout}
            >
              <LogOut size={16} />
              <span>{t('logout')}</span>
            </Button>
          </motion.div>
        </div>
      </motion.aside>
    </>
  );
}
