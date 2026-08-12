import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { coverLetterSchema } from "../validators/aiValidators";
import {
	atsAnalyze,	
	atsRewrite,
	interviewPrep,
	coverLetterGenerate,
	listCoverLetters,
} from "../controllers/aiController";

const router = Router();

router.use(requireAuth, requireRole(["CANDIDATE"]));

// Note: no request body needed for these three — resumeId comes from the
// URL, and the resume's own extractedText (already stored) is what's sent
// to the AI, not anything typed fresh by the user.
router.post("/ats-analyze/:resumeId", atsAnalyze);
router.post("/ats-rewrite/:resumeId", atsRewrite);
router.post("/interview-prep/:resumeId", interviewPrep);
router.post("/cover-letter", validate(coverLetterSchema), coverLetterGenerate);
router.get("/cover-letters", listCoverLetters);

export default router;
