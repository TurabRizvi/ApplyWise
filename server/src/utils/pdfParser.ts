import pdfParse from "pdf-parse";
import { AppError } from "./AppError";

// Pulls raw text out of an uploaded PDF so the AI features (ATS analyzer,
// rewrite, interview prep) have something to actually read. If a PDF has
// no extractable text (e.g. it's a scanned image with no text layer), we
// fail clearly here rather than silently sending an empty string to Gemini
// later and getting a confusing, low-quality AI response.
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const result = await pdfParse(buffer);
    const text = result.text.trim();

    if (!text || text.length < 20) {
      throw new AppError(
        "Could not extract readable text from this PDF. It may be a scanned image without selectable text.",
        400
      );
    }

    return text;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to read the uploaded PDF file", 400);
  }
}
