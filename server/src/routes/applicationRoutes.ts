import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createApplicationSchema, updateApplicationSchema } from "../validators/applicationValidators";
import {
  createApplication,
  listApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} from "../controllers/applicationController";

const router = Router();

router.use(requireAuth, requireRole(["CANDIDATE"]));

router.post("/", validate(createApplicationSchema), createApplication);
router.get("/", listApplications);
router.get("/:id", getApplicationById);
router.put("/:id", validate(updateApplicationSchema), updateApplication);
router.delete("/:id", deleteApplication);

export default router;
