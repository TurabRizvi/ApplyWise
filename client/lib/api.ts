const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Thin fetch wrapper. `credentials: "include"` is required so the httpOnly
// refresh-token cookie set by the backend actually gets sent/stored — the
// backend's CORS config (Day 1) only allows this because it explicitly
// trusts this frontend's origin.
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    // Status is attached so callers (see lib/auth-context.tsx) can tell a
    // 401 "token expired" apart from a real validation/permission error —
    // only a 401 should trigger a silent refresh-and-retry.
    throw new ApiError(body?.message || "Something went wrong. Please try again.", res.status);
  }

  return body as T;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
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

// Uses the httpOnly refresh cookie (sent automatically via credentials:
// "include") — no token is passed in because the browser attaches the
// cookie itself; that's the whole point of it being httpOnly.
export function refreshCandidateSession() {
  return apiFetch<{ success: boolean; data: { accessToken: string } }>("/api/auth/refresh", {
    method: "POST",
  });
}

export function logoutCandidate() {
  return apiFetch<{ success: boolean }>("/api/auth/logout", { method: "POST" });
}

export type Profile = {
  id: string;
  userId: string;
  fullName: string;
  bio: string | null;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  avatarUrl: string | null;
};

export function getMyProfile(token: string) {
  return apiFetch<{ success: boolean; data: Profile }>("/api/profile/me", {
    headers: authHeaders(token),
  });
}

export function updateMyProfile(token: string, input: Partial<Profile>) {
  return apiFetch<{ success: boolean; data: Profile }>("/api/profile/me", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
}

export type DashboardStats = {
  resumeCount: number;
  applicationsSent: number;
  interviewsScheduled: number;
  offers: number;
  rejections: number;
};

export function getDashboardStats(token: string) {
  return apiFetch<{ success: boolean; data: DashboardStats }>("/api/dashboard", {
    headers: authHeaders(token),
  });
}

export type ResumeSummary = {
  id: string;
  title: string;
  isUploaded: boolean;
  createdAt: string;
  updatedAt: string;
};

export function listResumes(token: string) {
  return apiFetch<{ success: boolean; data: ResumeSummary[] }>("/api/resumes", {
    headers: authHeaders(token),
  });
}

export function createResume(token: string, title: string) {
  return apiFetch<{ success: boolean; data: ResumeSummary }>("/api/resumes", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ title }),
  });
}

export function deleteResume(token: string, id: string) {
  return apiFetch<{ success: boolean }>(`/api/resumes/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function duplicateResume(token: string, id: string) {
  return apiFetch<{ success: boolean; data: ResumeSummary }>(`/api/resumes/${id}/duplicate`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

export function uploadResumeFile(token: string, file: File) {
  const formData = new FormData();
  formData.append("resume", file);
  return apiFetch<{ success: boolean; data: ResumeSummary }>("/api/resumes/upload", {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
}
