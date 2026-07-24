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

// Flash is used deliberately, not Pro — it's the model actually covered by
// Gemini's free tier as of writing. If you upgrade to a paid tier later,
// this is the one line that would change.
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
