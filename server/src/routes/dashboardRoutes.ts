import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { getCandidateDashboard } from "../controllers/dashboardController";

const router = Router();

router.use(requireAuth, requireRole(["CANDIDATE"]));
router.get("/", getCandidateDashboard);

export default router;
