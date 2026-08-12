import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const geminiEnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
});

const parsed = geminiEnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid Gemini configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const genAI = new GoogleGenerativeAI(parsed.data.GEMINI_API_KEY);

// gemini-2.0-flash was shut down by Google on June 1, 2026 — this is why
// every AI feature stopped working. gemini-3.5-flash is the current
// recommended free-tier model with no announced shutdown date yet.
// If you ever see AI features silently break again months from now,
// check https://ai.google.dev/gemini-api/docs/deprecations first —
// Google deprecates specific model IDs on a rolling schedule, not the
// whole API, so this is the most likely cause.
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
