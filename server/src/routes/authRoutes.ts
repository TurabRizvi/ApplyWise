import { Router } from "express";
import { authLimiter } from "../middleware/security";
import { validate } from "../middleware/validate";
import { registerCandidateSchema, loginSchema } from "../validators/authValidators";
import {
  registerCandidate,
  loginCandidate,
  refreshAccessToken,
  logout,
} from "../controllers/authController";

const router = Router();

// authLimiter applies ONLY to these routes (not the whole app) — this is
// what stops brute-force credential attacks without punishing normal usage
// of the rest of the API.
router.post("/register", authLimiter, validate(registerCandidateSchema), registerCandidate);
router.post("/login", authLimiter, validate(loginSchema), loginCandidate);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);

export default router;
