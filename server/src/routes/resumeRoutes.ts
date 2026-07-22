import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createResumeSchema,
  updateResumeSchema,
  educationSchema,
  experienceSchema,
} from "../validators/resumeValidators";
import {
  createResume,
  listResumes,
  getResumeById,
  updateResume,
  deleteResume,
  duplicateResume,
} from "../controllers/resumeController";
import { addEducation, updateEducation, deleteEducation } from "../controllers/educationController";
import { addExperience, updateExperience, deleteExperience } from "../controllers/experienceController";

const router = Router();

// Every resume route requires a logged-in CANDIDATE. Applied once here at
// the top rather than per-route, so it's impossible to accidentally add a
// new route later and forget to protect it.
router.use(requireAuth, requireRole(["CANDIDATE"]));

// ── Resume-level routes ──
router.post("/", validate(createResumeSchema), createResume);
router.get("/", listResumes);
router.get("/:id", getResumeById);
router.put("/:id", validate(updateResumeSchema), updateResume);
router.delete("/:id", deleteResume);
router.post("/:id/duplicate", duplicateResume);

// ── Education sub-routes (nested under a resume) ──
router.post("/:resumeId/education", validate(educationSchema), addEducation);
router.put("/:resumeId/education/:educationId", validate(educationSchema.partial()), updateEducation);
router.delete("/:resumeId/education/:educationId", deleteEducation);

// ── Experience sub-routes (nested under a resume) ──
router.post("/:resumeId/experience", validate(experienceSchema), addExperience);
router.put("/:resumeId/experience/:experienceId", validate(experienceSchema.partial()), updateExperience);
router.delete("/:resumeId/experience/:experienceId", deleteExperience);

export default router;
