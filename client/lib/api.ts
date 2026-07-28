const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Thin fetch wrapper. `credentials: "include"` is required so the httpOnly
// refresh-token cookie set by the backend actually gets sent/stored — the
// backend's CORS config (Day 1) only allows this because it explicitly
// trusts this frontend's origin.
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(body?.message || "Something went wrong. Please try again.");
  }

  return body as T;
}

export type AuthResponse = {
  success: boolean;
  data: {
    user?: { id: string; email: string; role: string };
    hrUser?: { id: string; email: string; role: string };
    organization?: { id: string; name: string };
    accessToken: string;
  };
};

export function registerCandidate(input: { email: string; password: string; fullName: string }) {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginCandidate(input: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function registerHr(input: { email: string; password: string; organizationName: string }) {
  return apiFetch<AuthResponse>("/api/hr-auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginHr(input: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/api/hr-auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
