import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateProfileSchema } from "../validators/profileValidators";
import { getMyProfile, updateMyProfile } from "../controllers/profileController";

const router = Router();

// Every route here requires a valid access token AND the CANDIDATE role —
// an HR user's token would be rejected by requireRole even if somehow they
// got this far, since their role is ORG_ADMIN/RECRUITER, not CANDIDATE.
router.use(requireAuth, requireRole(["CANDIDATE"]));

router.get("/me", getMyProfile);
router.put("/me", validate(updateProfileSchema), updateMyProfile);

export default router;
