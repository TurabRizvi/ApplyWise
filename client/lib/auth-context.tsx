"use client";

import * as React from "react";
import { ApiError, refreshCandidateSession, logoutCandidate, getMyProfile, type Profile } from "./api";

type AuthUser = { id: string; email: string; role: string } | null;

type AuthContextValue = {
  accessToken: string | null;
  user: AuthUser;
  profile: Profile | null;
  isInitializing: boolean;
  setAuth: (accessToken: string, user: AuthUser) => void;
  setProfile: (profile: Profile) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
  /**
   * Wraps any authenticated API call with automatic refresh-and-retry.
   * If the access token has expired (401), it silently uses the refresh
   * cookie to get a new one and retries the call ONCE before giving up.
   * This is what lets a candidate stay logged in across a page reload
   * without ever seeing an access-token expiry as a visible error.
   */
  callAuthed: <T,>(fn: (token: string) => Promise<T>) => Promise<T>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

// Deliberately in-memory only (React state), NOT localStorage or sessionStorage.
// This matches the backend's design: the access token is short-lived and
// meant to live only in memory, so it can't be read by a malicious script
// the way localStorage could be. Losing it on a hard refresh is expected —
// the refresh-token flow (httpOnly cookie) is what silently restores a
// session on page load instead (see the bootstrap effect below).
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<AuthUser>(null);
  const [profile, setProfileState] = React.useState<Profile | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);

  const setAuth = (token: string, authUser: AuthUser) => {
    setAccessToken(token);
    setUser(authUser);
  };

  const setProfile = (p: Profile) => setProfileState(p);

  const clearAuth = () => {
    setAccessToken(null);
    setUser(null);
    setProfileState(null);
  };

  const logout = async () => {
    try {
      await logoutCandidate();
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
          const refreshed = await refreshCandidateSession().catch(() => null);
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

  // On first load, the access token is empty (it's in-memory only), so we
  // silently attempt to restore the session using the httpOnly refresh
  // cookie. If it succeeds, we also fetch the profile so "Welcome back,
  // {name}" works without the user re-entering anything.
  React.useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const refreshed = await refreshCandidateSession();
        if (cancelled) return;
        const token = refreshed.data.accessToken;
        setAccessToken(token);

        const profileRes = await getMyProfile(token);
        if (cancelled) return;
        setProfileState(profileRes.data);
        setUser({ id: profileRes.data.userId, email: "", role: "CANDIDATE" });
      } catch {
        // No valid session — this is the normal case for a logged-out
        // visitor, not an error worth surfacing.
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
    <AuthContext.Provider
      value={{ accessToken, user, profile, isInitializing, setAuth, setProfile, clearAuth, logout, callAuthed }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
