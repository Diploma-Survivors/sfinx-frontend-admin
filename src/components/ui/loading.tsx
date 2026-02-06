'use client';

import { Loader2 } from 'lucide-react';

interface LoadingProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function Loading({
  title = 'Đang tải...',
  description = 'Vui lòng chờ trong giây lát',
  className = '',
}: LoadingProps) {
  return (
    <div
      className={`min-h-screen bg-background flex items-center justify-center ${className}`}
    >
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="absolute inset-0 w-16 h-16 bg-primary rounded-full mx-auto animate-ping opacity-20" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}
