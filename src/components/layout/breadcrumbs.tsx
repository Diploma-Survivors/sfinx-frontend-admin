'use client';

import { ChevronRight, Home } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import React from 'react';
import { useTranslations } from 'next-intl';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations('Breadcrumbs');

  // Skip rendering on home page if desired, or keep it as just "Home"
  if (pathname === '/') {
    return null;
  }

  const pathSegments = pathname.split('/').filter((segment) => segment !== '');

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');

    // Check if the segment is a number (ID)
    const isId = !isNaN(Number(segment)) || segment.length > 20; // Assume long strings (e.g. slugs/UUIDs) are IDs if they don't have translations

    let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    if (!isId) {
      try {
        // next-intl throws by default if key is missing in some configs
        // We can use t.raw() or a try-catch to be safe
        const translated = t(segment);
        // If the translation returns the key itself, it's effectively "not found" 
        // depending on how next-intl is configured, but usually t(key) returns 
        // the translated value or the fallback.
        if (translated && translated !== segment) {
          label = translated;
        }
      } catch (e) {
        // Fallback to formatted segment name
      }
    }

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
