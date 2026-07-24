import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { uploadResumeFiles } from "../middleware/upload";
import { createBatchSchema, compareResumesSchema } from "../validators/screeningValidators";
import {
  createBatch,
  listBatches,
  getBatchWithRankedResumes,
  bulkUploadAndScore,
  compareCandidates,
} from "../controllers/screeningController";

const router = Router();

router.use(requireAuth, requireRole(["ORG_ADMIN", "RECRUITER"]));

router.post("/", validate(createBatchSchema), createBatch);
router.get("/", listBatches);
router.get("/:batchId", getBatchWithRankedResumes);
router.post("/:batchId/resumes", uploadResumeFiles, bulkUploadAndScore);
router.post("/:batchId/compare", validate(compareResumesSchema), compareCandidates);

export default router;
