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

export type LatestAtsScore = {
  overallScore: number | null;
  formattingScore: number | null;
  keywordScore: number | null;
  grammarScore: number | null;
  actionVerbScore: number | null;
  analyzedAt: string;
} | null;

export type RecentActivityItem = { label: string; createdAt: string };

export type DashboardStats = {
  resumeCount: number;
  applicationsSent: number;
  interviewsScheduled: number;
  offers: number;
  rejections: number;
  latestScore: LatestAtsScore;
  recentActivity: RecentActivityItem[];
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

// ── Resume detail + sections ──

export type Education = {
  id: string; institution: string; degree: string; fieldOfStudy: string | null;
  startDate: string | null; endDate: string | null; description: string | null;
};
export type Experience = {
  id: string; company: string; role: string; startDate: string | null; endDate: string | null;
  isCurrent: boolean; description: string | null;
};
export type ResumeProject = {
  id: string; name: string; description: string | null; techStack: string | null; projectUrl: string | null;
};
export type Skill = { id: string; name: string };
export type Certification = { id: string; name: string; issuer: string | null; issueDate: string | null };
export type Language = { id: string; name: string; proficiency: string | null };

export type ResumeDetail = ResumeSummary & {
  extractedText: string | null;
  education: Education[];
  experience: Experience[];
  projects: ResumeProject[];
  skills: Skill[];
  certifications: Certification[];
  languages: Language[];
};

export function getResume(token: string, id: string) {
  return apiFetch<{ success: boolean; data: ResumeDetail }>(`/api/resumes/${id}`, { headers: authHeaders(token) });
}

export function updateResumeTitle(token: string, id: string, title: string) {
  return apiFetch<{ success: boolean; data: ResumeSummary }>(`/api/resumes/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ title }),
  });
}

// Education
export function addEducation(token: string, resumeId: string, input: Omit<Education, "id">) {
  return apiFetch<{ success: boolean; data: Education }>(`/api/resumes/${resumeId}/education`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(input),
  });
}
export function updateEducation(token: string, resumeId: string, id: string, input: Partial<Omit<Education, "id">>) {
  return apiFetch<{ success: boolean; data: Education }>(`/api/resumes/${resumeId}/education/${id}`, {
    method: "PUT", headers: authHeaders(token), body: JSON.stringify(input),
  });
}
export function deleteEducation(token: string, resumeId: string, id: string) {
  return apiFetch<{ success: boolean }>(`/api/resumes/${resumeId}/education/${id}`, {
    method: "DELETE", headers: authHeaders(token),
  });
}

// Experience
export function addExperience(token: string, resumeId: string, input: Omit<Experience, "id">) {
  return apiFetch<{ success: boolean; data: Experience }>(`/api/resumes/${resumeId}/experience`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(input),
  });
}
export function updateExperience(token: string, resumeId: string, id: string, input: Partial<Omit<Experience, "id">>) {
  return apiFetch<{ success: boolean; data: Experience }>(`/api/resumes/${resumeId}/experience/${id}`, {
    method: "PUT", headers: authHeaders(token), body: JSON.stringify(input),
  });
}
export function deleteExperience(token: string, resumeId: string, id: string) {
  return apiFetch<{ success: boolean }>(`/api/resumes/${resumeId}/experience/${id}`, {
    method: "DELETE", headers: authHeaders(token),
  });
}

// Projects
export function addProject(token: string, resumeId: string, input: Omit<ResumeProject, "id">) {
  return apiFetch<{ success: boolean; data: ResumeProject }>(`/api/resumes/${resumeId}/projects`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(input),
  });
}
export function updateProject(token: string, resumeId: string, id: string, input: Partial<Omit<ResumeProject, "id">>) {
  return apiFetch<{ success: boolean; data: ResumeProject }>(`/api/resumes/${resumeId}/projects/${id}`, {
    method: "PUT", headers: authHeaders(token), body: JSON.stringify(input),
  });
}
export function deleteProject(token: string, resumeId: string, id: string) {
  return apiFetch<{ success: boolean }>(`/api/resumes/${resumeId}/projects/${id}`, {
    method: "DELETE", headers: authHeaders(token),
  });
}

// Skills (add/delete only — matches backend, no update route exists)
export function addSkill(token: string, resumeId: string, name: string) {
  return apiFetch<{ success: boolean; data: Skill }>(`/api/resumes/${resumeId}/skills`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify({ name }),
  });
}
export function deleteSkill(token: string, resumeId: string, id: string) {
  return apiFetch<{ success: boolean }>(`/api/resumes/${resumeId}/skills/${id}`, {
    method: "DELETE", headers: authHeaders(token),
  });
}

// Certifications (add/delete only)
export function addCertification(token: string, resumeId: string, input: Omit<Certification, "id">) {
  return apiFetch<{ success: boolean; data: Certification }>(`/api/resumes/${resumeId}/certifications`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(input),
  });
}
export function deleteCertification(token: string, resumeId: string, id: string) {
  return apiFetch<{ success: boolean }>(`/api/resumes/${resumeId}/certifications/${id}`, {
    method: "DELETE", headers: authHeaders(token),
  });
}

// Languages (add/delete only)
export function addLanguage(token: string, resumeId: string, input: Omit<Language, "id">) {
  return apiFetch<{ success: boolean; data: Language }>(`/api/resumes/${resumeId}/languages`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(input),
  });
}
export function deleteLanguage(token: string, resumeId: string, id: string) {
  return apiFetch<{ success: boolean }>(`/api/resumes/${resumeId}/languages/${id}`, {
    method: "DELETE", headers: authHeaders(token),
  });
}

// ── AI features ──

export type AtsAnalysisResult = {
  overallScore: number; formattingScore: number; keywordScore: number; grammarScore: number; actionVerbScore: number;
  missingKeywords: string[]; weakBulletPoints: string[]; formattingSuggestions: string[];
  grammarSuggestions: string[]; recommendedSkills: string[];
};
export function runAtsAnalysis(token: string, resumeId: string) {
  return apiFetch<{ success: boolean; data: AtsAnalysisResult }>(`/api/ai/ats-analyze/${resumeId}`, {
    method: "POST", headers: authHeaders(token),
  });
}

export type AtsRewriteResult = { rewrittenResume: string; summaryOfChanges: string[] };
export function runAtsRewrite(token: string, resumeId: string) {
  return apiFetch<{ success: boolean; data: AtsRewriteResult }>(`/api/ai/ats-rewrite/${resumeId}`, {
    method: "POST", headers: authHeaders(token),
  });
}

export type InterviewQuestion = { question: string; category: "TECHNICAL" | "HR" | "CODING" };
export function runInterviewPrep(token: string, resumeId: string) {
  return apiFetch<{ success: boolean; data: { questions: InterviewQuestion[] } }>(`/api/ai/interview-prep/${resumeId}`, {
    method: "POST", headers: authHeaders(token),
  });
}

export function generateCoverLetter(
  token: string,
  input: { resumeId: string; companyName: string; jobTitle: string; jobDescription: string }
) {
  return apiFetch<{ success: boolean; data: { id: string; companyName: string; jobTitle: string; content: string } }>(
    "/api/ai/cover-letter",
    { method: "POST", headers: authHeaders(token), body: JSON.stringify(input) }
  );
}

// ── Application tracker ──

export type ApplicationStatus =
  | "WISHLIST" | "APPLIED" | "ASSESSMENT" | "INTERVIEW" | "OFFER" | "ACCEPTED" | "REJECTED";

export type JobApplication = {
  id: string; companyName: string; position: string; jobUrl: string | null; location: string | null;
  salary: string | null; status: ApplicationStatus; notes: string | null; dateApplied: string | null;
  createdAt: string; updatedAt: string;
};

export function listApplications(token: string, params?: { status?: ApplicationStatus; search?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  const qs = query.toString();
  return apiFetch<{ success: boolean; data: JobApplication[] }>(`/api/applications${qs ? `?${qs}` : ""}`, {
    headers: authHeaders(token),
  });
}

export function createApplication(
  token: string,
  input: Omit<JobApplication, "id" | "createdAt" | "updatedAt">
) {
  return apiFetch<{ success: boolean; data: JobApplication }>("/api/applications", {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(input),
  });
}

export function updateApplication(token: string, id: string, input: Partial<Omit<JobApplication, "id">>) {
  return apiFetch<{ success: boolean; data: JobApplication }>(`/api/applications/${id}`, {
    method: "PUT", headers: authHeaders(token), body: JSON.stringify(input),
  });
}

export function deleteApplication(token: string, id: string) {
  return apiFetch<{ success: boolean }>(`/api/applications/${id}`, {
    method: "DELETE", headers: authHeaders(token),
  });
}

// ── AI Assistant ──

export type AssistantMessage = { role: "user" | "assistant"; content: string };

export function chatWithAssistant(token: string, message: string, history: AssistantMessage[]) {
  return apiFetch<{ success: boolean; data: { reply: string } }>("/api/assistant", {
    method: "POST", headers: authHeaders(token), body: JSON.stringify({ message, history }),
  });
}

// ── HR: "who am I" + dashboard ──

export type HrMe = {
  id: string;
  email: string;
  role: "ORG_ADMIN" | "RECRUITER";
  organization: { id: string; name: string };
};

export function getHrMe(token: string) {
  return apiFetch<{ success: boolean; data: HrMe }>("/api/hr-auth/me", { headers: authHeaders(token) });
}

export function refreshHrSession() {
  return apiFetch<{ success: boolean; data: { accessToken: string } }>("/api/hr-auth/refresh", { method: "POST" });
}

export function logoutHrSession() {
  return apiFetch<{ success: boolean }>("/api/hr-auth/logout", { method: "POST" });
}

export type ScoreDistribution = {
  "80-100": number;
  "60-80": number;
  "40-60": number;
  "20-40": number;
  "0-20": number;
};

export type HrDashboardStats = {
  totalBatches: number;
  candidatesScreened: number;
  averageMatchScore: number;
  scoreDistribution: ScoreDistribution;
};

export function getHrDashboardStats(token: string) {
  return apiFetch<{ success: boolean; data: HrDashboardStats }>("/api/hr/dashboard", { headers: authHeaders(token) });
}

// ── HR: screening batches ──

export type ScreeningBatch = {
  id: string;
  jobTitle: string;
  jobDescription?: string;
  createdAt: string;
  _count?: { candidates: number };
};

export function createScreeningBatch(token: string, input: { jobTitle: string; jobDescription: string }) {
  return apiFetch<{ success: boolean; data: ScreeningBatch }>("/api/hr/screening-batches", {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(input),
  });
}

export function listScreeningBatches(token: string) {
  return apiFetch<{ success: boolean; data: ScreeningBatch[] }>("/api/hr/screening-batches", {
    headers: authHeaders(token),
  });
}

export type ScreenedResume = {
  id: string;
  fileUrl: string;
  candidateName: string | null;
  atsScore: number | null;
  matchedSkills: string | null; // JSON-encoded array
  gaps: string | null; // JSON-encoded array
  createdAt: string;
};

export function getScreeningBatch(token: string, batchId: string) {
  return apiFetch<{ success: boolean; data: { batch: ScreeningBatch; candidates: ScreenedResume[] } }>(
    `/api/hr/screening-batches/${batchId}`,
    { headers: authHeaders(token) }
  );
}

export type BulkUploadResult = { fileName: string; success: boolean; error?: string };

export function bulkUploadResumes(token: string, batchId: string, files: File[]) {
  const formData = new FormData();
  files.forEach((f) => formData.append("resumes", f));
  return apiFetch<{ success: boolean; data: { results: BulkUploadResult[] } }>(
    `/api/hr/screening-batches/${batchId}/resumes`,
    { method: "POST", headers: authHeaders(token), body: formData }
  );
}

export function compareCandidates(token: string, batchId: string, resumeIds: string[]) {
  return apiFetch<{ success: boolean; data: ScreenedResume[] }>(
    `/api/hr/screening-batches/${batchId}/compare`,
    { method: "POST", headers: authHeaders(token), body: JSON.stringify({ resumeIds }) }
  );
}

export type CoverLetterRecord = {
  id: string;
  companyName: string;
  jobTitle: string;
  content: string;
  createdAt: string;
};

export function listCoverLetters(token: string) {
  return apiFetch<{ success: boolean; data: CoverLetterRecord[] }>("/api/ai/cover-letters", {
    headers: authHeaders(token),
  });
}

// ── HR: team management (invite/list/deactivate recruiters within an org) ──

export type TeamMember = {
  id: string;
  email: string;
  role: "ORG_ADMIN" | "RECRUITER";
  isActive: boolean;
  createdAt: string;
};

export function listTeamMembers(token: string) {
  return apiFetch<{ success: boolean; data: TeamMember[] }>("/api/hr-auth/team", {
    headers: authHeaders(token),
  });
}

export function addTeamMember(token: string, input: { email: string; password: string }) {
  return apiFetch<{ success: boolean; data: TeamMember }>("/api/hr-auth/team", {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(input),
  });
}

export function setTeamMemberActiveStatus(token: string, id: string, isActive: boolean) {
  return apiFetch<{ success: boolean; data: TeamMember }>(`/api/hr-auth/team/${id}/active-status`, {
    method: "PATCH", headers: authHeaders(token), body: JSON.stringify({ isActive }),
  });
}
