'use client';

import { ChevronRight, Home } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import React from 'react';

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Skip rendering on home page if desired, or keep it as just "Home"
  if (pathname === '/') {
    return null;
  }

  const pathSegments = pathname.split('/').filter((segment) => segment !== '');

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    const isLast = index === pathSegments.length - 1;

    return {
      href,
      label,
      isLast,
    };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center text-sm text-slate-500 dark:text-slate-400"
    >
      <Link
        href="/"
        className="flex items-center hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((crumb) => (
        <React.Fragment key={crumb.href}>
          <ChevronRight className="h-4 w-4 mx-2 text-slate-300 dark:text-slate-600" />
          {crumb.isLast ? (
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
