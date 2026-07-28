"use client";

import * as React from "react";

type AuthUser = { id: string; email: string; role: string } | null;

type AuthContextValue = {
  accessToken: string | null;
  user: AuthUser;
  setAuth: (accessToken: string, user: AuthUser) => void;
  clearAuth: () => void;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

// Deliberately in-memory only (React state), NOT localStorage or sessionStorage.
// This matches the backend's design: the access token is short-lived and
// meant to live only in memory, so it can't be read by a malicious script
// the way localStorage could be. Losing it on a hard refresh is expected —
// the refresh-token flow (httpOnly cookie) is what silently restores a
// session on page load instead.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<AuthUser>(null);

  const setAuth = (token: string, authUser: AuthUser) => {
    setAccessToken(token);
    setUser(authUser);
  };

  const clearAuth = () => {
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
