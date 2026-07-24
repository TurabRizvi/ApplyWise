import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { extractTextFromPdf } from "../utils/pdfParser";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload";

// This creates a NEW resume record from an uploaded PDF — it does not try
// to parse the PDF into structured sections (education/experience/etc).
// The extracted raw text is stored on the resume and used directly by the
// AI features later. Trying to auto-parse a PDF into perfectly structured
// fields is unreliable and out of scope — the candidate can still manually
// fill in the builder sections later if they want structured data too.
export const uploadResume = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;

  if (!req.file) {
    throw new AppError("No file uploaded. Field name must be 'resume'.", 400);
  }

  const extractedText = await extractTextFromPdf(req.file.buffer);
  const fileUrl = await uploadBufferToCloudinary(req.file.buffer, `applywise/resumes/${userId}`);

  const resume = await prisma.resume.create({
    data: {
      userId,
      title: req.file.originalname.replace(/\.pdf$/i, "") || "Uploaded Resume",
      isUploaded: true,
      sourceFileUrl: fileUrl,
      extractedText,
    },
  });

  res.status(201).json({ success: true, data: resume });
});
