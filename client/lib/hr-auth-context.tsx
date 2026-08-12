"use client";

import * as React from "react";
import { ApiError, refreshHrSession, logoutHrSession, getHrMe, type HrMe } from "./api";

type HrAuthContextValue = {
  accessToken: string | null;
  hrUser: HrMe | null;
  isInitializing: boolean;
  setAuth: (accessToken: string) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
  refetchMe: () => Promise<void>;
  callAuthed: <T,>(fn: (token: string) => Promise<T>) => Promise<T>;
};

const HrAuthContext = React.createContext<HrAuthContextValue | undefined>(undefined);

// Kept as a SEPARATE context/provider from the candidate side on purpose —
// HR sessions use a different refresh cookie (hrRefreshToken vs
// refreshToken) and a different backend auth table entirely. Mixing them
// into one context would make it easy to accidentally leak candidate
// session logic into the HR side or vice versa.
export function HrAuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [hrUser, setHrUser] = React.useState<HrMe | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);

  const setAuth = (token: string) => setAccessToken(token);

  const clearAuth = () => {
    setAccessToken(null);
    setHrUser(null);
  };

  const logout = async () => {
    try {
      await logoutHrSession();
    } finally {
      clearAuth();
    }
  };

  const callAuthed = React.useCallback(
    async <T,>(fn: (token: string) => Promise<T>): Promise<T> => {
      if (!accessToken) throw new ApiError("Not authenticated", 401);
      try {
        return await fn(accessToken);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          const refreshed = await refreshHrSession().catch(() => null);
          if (refreshed) {
            setAccessToken(refreshed.data.accessToken);
            return fn(refreshed.data.accessToken);
          }
          clearAuth();
        }
        throw err;
      }
    },
    [accessToken]
  );

  const refetchMe = React.useCallback(async () => {
    if (!accessToken) return;
    const res = await getHrMe(accessToken);
    setHrUser(res.data);
  }, [accessToken]);

  React.useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        const refreshed = await refreshHrSession();
        if (cancelled) return;
        const token = refreshed.data.accessToken;
        setAccessToken(token);
        const me = await getHrMe(token);
        if (cancelled) return;
        setHrUser(me.data);
      } catch {
        // Normal case for a logged-out visitor.
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <HrAuthContext.Provider
      value={{ accessToken, hrUser, isInitializing, setAuth, clearAuth, logout, refetchMe, callAuthed }}
    >
      {children}
    </HrAuthContext.Provider>
  );
}

export function useHrAuth() {
  const ctx = React.useContext(HrAuthContext);
  if (!ctx) throw new Error("useHrAuth must be used within an HrAuthProvider");
  return ctx;
}
