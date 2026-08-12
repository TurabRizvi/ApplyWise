import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { addTeamMemberSchema } from "../validators/teamValidators";
import { addTeamMember, listTeamMembers, setTeamMemberActiveStatus } from "../controllers/hrTeamController";

const router = Router();

// Both roles can view the team list; only ORG_ADMIN can add/deactivate —
// that check happens inside the controller itself (not just here), since
// it also needs to confirm the target belongs to the SAME organization.
router.use(requireAuth, requireRole(["ORG_ADMIN", "RECRUITER"]));

router.get("/", listTeamMembers);
router.post("/", validate(addTeamMemberSchema), addTeamMember);
router.patch("/:id/active-status", setTeamMemberActiveStatus);

export default router;
