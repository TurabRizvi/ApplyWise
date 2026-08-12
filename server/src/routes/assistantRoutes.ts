import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { assistantMessageSchema } from "../validators/assistantValidators";
import { chatWithAssistant } from "../controllers/assistantController";

const router = Router();

router.use(requireAuth, requireRole(["CANDIDATE", "ORG_ADMIN", "RECRUITER"]));
router.post("/", validate(assistantMessageSchema), chatWithAssistant);

export default router;
