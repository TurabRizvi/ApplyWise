import { geminiModel } from "../config/gemini";
import { AppError } from "../utils/AppError";

// ── Shared helper: call Gemini, enforce JSON output, retry once on a
// malformed response before giving up. Gemini sometimes wraps JSON in
// markdown code fences (```json ... ```) even when told not to — we strip
// that defensively rather than trusting the model to always comply.
async function callGeminiForJson<T>(prompt: string): Promise<T> {
  const attempt = async (): Promise<T> => {
    const result = await geminiModel.generateContent(prompt);
    const raw = result.response.text().trim();
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleaned) as T;
  };

  try {
    return await attempt();
  } catch {
    // one retry — AI output is non-deterministic, a single malformed
    // response isn't necessarily a real failure, just a bad roll.
    try {
      return await attempt();
    } catch {
      throw new AppError(
        "The AI service returned an unexpected response. Please try again.",
        502
      );
    }
  }
}

export type AtsAnalysisResult = {
  overallScore: number;
  formattingScore: number;
  keywordScore: number;
  grammarScore: number;
  actionVerbScore: number;
  missingKeywords: string[];
  weakBulletPoints: string[];
  formattingSuggestions: string[];
  grammarSuggestions: string[];
  recommendedSkills: string[];
};

export async function analyzeResumeATS(resumeText: string): Promise<AtsAnalysisResult> {
  const prompt = `You are an ATS (Applicant Tracking System) resume evaluator.
Analyze the resume text below and return ONLY a raw JSON object (no markdown, no explanation) with this exact shape:
{
  "overallScore": number (0-100),
  "formattingScore": number (0-100),
  "keywordScore": number (0-100),
  "grammarScore": number (0-100),
  "actionVerbScore": number (0-100),
  "missingKeywords": string[],
  "weakBulletPoints": string[],
  "formattingSuggestions": string[],
  "grammarSuggestions": string[],
  "recommendedSkills": string[]
}

Resume text:
"""
${resumeText}
"""`;

  return callGeminiForJson<AtsAnalysisResult>(prompt);
}

export type AtsRewriteResult = {
  rewrittenResume: string;
  summaryOfChanges: string[];
};

export async function rewriteResumeATS(resumeText: string): Promise<AtsRewriteResult> {
  const prompt = `You are a professional resume writer specializing in ATS optimization.
Rewrite the resume text below to be more ATS-friendly: stronger action verbs, quantified achievements where plausible, better formatting for parsing, and clearer structure. Do not invent facts, companies, or dates that are not implied by the original.
Return ONLY a raw JSON object (no markdown, no explanation) with this exact shape:
{
  "rewrittenResume": string (the full rewritten resume as plain text),
  "summaryOfChanges": string[] (a short bullet list of what was improved)
}

Original resume text:
"""
${resumeText}
"""`;

  return callGeminiForJson<AtsRewriteResult>(prompt);
}

export type InterviewQuestion = { question: string; category: "TECHNICAL" | "HR" | "CODING" };
export type InterviewPrepResult = { questions: InterviewQuestion[] };

export async function generateInterviewPrep(resumeText: string): Promise<InterviewPrepResult> {
  const prompt = `You are an interview preparation coach.
Based on the resume text below, generate interview questions personalized to this candidate's actual skills, experience, and projects — not generic questions.
Return ONLY a raw JSON object (no markdown, no explanation) with this exact shape:
{
  "questions": [
    { "question": string, "category": "TECHNICAL" | "HR" | "CODING" }
  ]
}
Generate 5 TECHNICAL, 3 HR, and 3 CODING questions (11 total).

Resume text:
"""
${resumeText}
"""`;

  return callGeminiForJson<InterviewPrepResult>(prompt);
}

export type CoverLetterResult = { content: string };

export async function generateCoverLetter(
  resumeText: string,
  companyName: string,
  jobTitle: string,
  jobDescription: string
): Promise<CoverLetterResult> {
  const prompt = `You are a professional cover letter writer.
Write a compelling, professional cover letter for the candidate below, tailored to the specific company, job title, and job description provided. Do not invent facts not present in the resume.
Return ONLY a raw JSON object (no markdown, no explanation) with this exact shape:
{ "content": string }

Company: ${companyName}
Job Title: ${jobTitle}
Job Description:
"""
${jobDescription}
"""

Candidate resume text:
"""
${resumeText}
"""`;

  return callGeminiForJson<CoverLetterResult>(prompt);
}

// Used by the HR screening side (Day 4, HR section) — same scoring logic,
// reused rather than duplicated, so candidate-side and HR-side scores are
// always produced by identical criteria.
export type ScreeningResult = {
  atsScore: number;
  matchedSkills: string[];
  gaps: string[];
};

export async function scoreResumeAgainstJob(
  resumeText: string,
  jobDescription: string
): Promise<ScreeningResult> {
  const prompt = `You are a recruiter's resume-screening assistant.
Score how well the candidate resume below matches the job description.
Return ONLY a raw JSON object (no markdown, no explanation) with this exact shape:
{
  "atsScore": number (0-100, how well this resume matches the job description),
  "matchedSkills": string[] (skills/keywords from the JD found in the resume),
  "gaps": string[] (important requirements from the JD missing from the resume)
}

Job Description:
"""
${jobDescription}
"""

Candidate Resume:
"""
${resumeText}
"""`;

  return callGeminiForJson<ScreeningResult>(prompt);
}
