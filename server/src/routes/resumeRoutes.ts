import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createResumeSchema,
  updateResumeSchema,
  educationSchema,
  experienceSchema,
} from "../validators/resumeValidators";
import { skillSchema, projectSchema, certificationSchema, languageSchema } from "../validators/sectionValidators";
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
import {
  addSkill,
  deleteSkill,
  addProject,
  updateProject,
  deleteProject,
  addCertification,
  deleteCertification,
  addLanguage,
  deleteLanguage,
} from "../controllers/sectionControllers";
import { uploadResumeFile } from "../middleware/upload";
import { uploadResume } from "../controllers/resumeUploadController";

const router = Router();

// Every resume route requires a logged-in CANDIDATE. Applied once here at
// the top rather than per-route, so it's impossible to accidentally add a
// new route later and forget to protect it.
router.use(requireAuth, requireRole(["CANDIDATE"]));

// ── Upload a resume PDF (creates a new resume record) ──
router.post("/upload", uploadResumeFile, uploadResume);

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

// ── Skill sub-routes ──
router.post("/:resumeId/skills", validate(skillSchema), addSkill);
router.delete("/:resumeId/skills/:skillId", deleteSkill);

// ── Project sub-routes ──
router.post("/:resumeId/projects", validate(projectSchema), addProject);
router.put("/:resumeId/projects/:projectId", validate(projectSchema.partial()), updateProject);
router.delete("/:resumeId/projects/:projectId", deleteProject);

// ── Certification sub-routes ──
router.post("/:resumeId/certifications", validate(certificationSchema), addCertification);
router.delete("/:resumeId/certifications/:certificationId", deleteCertification);

// ── Language sub-routes ──
router.post("/:resumeId/languages", validate(languageSchema), addLanguage);
router.delete("/:resumeId/languages/:languageId", deleteLanguage);

export default router;
