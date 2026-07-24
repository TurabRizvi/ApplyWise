import multer from "multer";
import { AppError } from "../utils/AppError";

// Files are held in memory (not written to disk) since we immediately
// stream them to Cloudinary and extract text — no need to touch the local
// filesystem at all, which also means nothing lingers on the server disk.
const storage = multer.memoryStorage();

// Only PDFs, and a hard size cap — this is a security control, not just a
// UX nicety. Without a size limit, someone could upload a huge file and tie
// up server memory/bandwidth (a simple denial-of-service vector). Without
// a type check, someone could upload an executable disguised with a PDF
// extension and we'd blindly forward it to Cloudinary/storage.
export const uploadResumeFile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new AppError("Only PDF files are allowed", 400));
    }
    cb(null, true);
  },
}).single("resume");

// HR bulk upload — multiple PDFs at once, capped at 20 per batch. The cap
// is deliberate: without it, one request could try to upload hundreds of
// files and tie up server memory/Gemini API calls in one shot.
export const uploadResumeFiles = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new AppError("Only PDF files are allowed", 400));
    }
    cb(null, true);
  },
}).array("resumes", 20);
