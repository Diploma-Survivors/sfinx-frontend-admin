"use client";

import { ThemeProvider } from "@/components/providers";
import { AppProvider } from "@/contexts/app-context";
import { ReduxProvider } from "@/store/providers";
import type { DecodedAccessToken } from "@/types/states";
import { SessionProvider } from "next-auth/react";
import { DialogProvider } from "./dialog-provider";
import { ToastProvider } from "./toast-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface ClientProviderProps {
  children: React.ReactNode;
  decodedAccessToken: DecodedAccessToken | null;
}

export function ClientProvider({
  children,
  decodedAccessToken,
}: ClientProviderProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <DialogProvider>
            <ToastProvider>
              <ReduxProvider>
                <AppProvider decodedAccessToken={decodedAccessToken}>
                  {children}
                </AppProvider>
              </ReduxProvider>
            </ToastProvider>
          </DialogProvider>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
