'use client';

import clientApi from '@/lib/apis/axios-client';
import type { DecodedAccessToken, UserInfo } from '@/types/states';
import { IssuerType } from '@/types/states';
import { UserProfile } from '@/types/user';
import { usePathname } from '@/i18n/routing';
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Permission, PermissionEnum } from '@/types/permission';
import { getAllCurrentUserPermission } from '@/services/permission-service';

interface AppProviderProps {
  children: ReactNode;
  decodedAccessToken: DecodedAccessToken | null;
}

interface AppContextType {
  user?: UserProfile;
  permissions: Permission[];
  hasPermission: (permissionId: PermissionEnum) => boolean;
  shouldHideNavigation: boolean;
  isLoading: boolean;
  clearUserData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const dedicatedPagesPattern =
  process.env.NEXT_PUBLIC_DEDICATED_PAGES_PATTERN ||
  '^(?:/problems/(?:create|[^/]+(?:/(create|edit))?)|/contests/(?:create|[^/]+(?:/(?:edit|stats|standing|submissions)))|/options)$';

export function AppProvider({
  children,
  decodedAccessToken,
}: AppProviderProps) {
  const [user, setUser] = useState<UserProfile>();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(!!decodedAccessToken);

  const pathname = usePathname();
  const shouldHideNavigation = pathname === '/login';

  const clearUserData = () => {
    setUser(undefined);
    setPermissions([]);
  };

  const hasPermission = useCallback(
    (permissionId: PermissionEnum) => {
      return permissions.some((p) => p.id === permissionId);
    },
    [permissions]
  );

  useEffect(() => {
    // Don't fetch user data if on login page
    if (shouldHideNavigation) {
      return;
    }

    if (decodedAccessToken) {
      setIsLoading(true);

      // Fetch user and permissions in parallel
      Promise.all([
        clientApi.get('/auth/me'),
        getAllCurrentUserPermission(decodedAccessToken.sub)
      ])
        .then(([userResponse, permissionsResponse]) => {
          setUser(userResponse.data.data);
          setPermissions(permissionsResponse);

          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        })
        .catch((error) => {
          console.error('Failed to fetch user data or permissions:', error);
          setIsLoading(false);
        });
    }
  }, [decodedAccessToken, shouldHideNavigation]);

  const value: AppContextType = {
    user,
    permissions,
    hasPermission,
    shouldHideNavigation,
    isLoading,
    clearUserData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
