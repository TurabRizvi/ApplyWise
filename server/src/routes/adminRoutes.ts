import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { setActiveStatusSchema } from "../validators/adminValidators";
import {
  getPlatformStats,
  listUsers,
  getUserById,
  setUserActiveStatus,
  deleteUserAdmin,
  listOrganizations,
  getOrganizationById,
  setHrUserActiveStatus,
  deleteOrganizationAdmin,
  listAllResumes,
  deleteResumeAdmin,
} from "../controllers/adminController";

const router = Router();

// Every single route below requires the ADMIN role. There is deliberately
// NO public registration endpoint for admin accounts anywhere in this app —
// admin users must be created directly in the database (see Day 4 recap).
// This is standard practice: a self-service "become an admin" endpoint is
// a serious privilege-escalation risk if it's ever reachable by mistake.
router.use(requireAuth, requireRole(["ADMIN"]));

router.get("/stats", getPlatformStats);

router.get("/users", listUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/active-status", validate(setActiveStatusSchema), setUserActiveStatus);
router.delete("/users/:id", deleteUserAdmin);

router.get("/organizations", listOrganizations);
router.get("/organizations/:id", getOrganizationById);
router.patch("/hr-users/:id/active-status", validate(setActiveStatusSchema), setHrUserActiveStatus);
router.delete("/organizations/:id", deleteOrganizationAdmin);

router.get("/resumes", listAllResumes);
router.delete("/resumes/:id", deleteResumeAdmin);

export default router;
