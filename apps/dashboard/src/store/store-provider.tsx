'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore, type AuthUser } from './auth.store';

interface StoreProviderProps {
  children: React.ReactNode;
  user: AuthUser;
  tenantId: string;
}

export function StoreProvider({ children, user, tenantId }: StoreProviderProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      useAuthStore.getState().setAuth(user, tenantId);
      initialized.current = true;
    }
  }, [user, tenantId]);

  return <>{children}</>;
}
