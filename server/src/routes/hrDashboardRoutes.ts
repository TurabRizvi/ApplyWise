import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { getHrDashboardStats } from "../controllers/hrDashboardController";

const router = Router();

router.use(requireAuth, requireRole(["ORG_ADMIN", "RECRUITER"]));
router.get("/", getHrDashboardStats);

export default router;
