import { Router } from "express";
import { authLimiter } from "../middleware/security";
import { validate } from "../middleware/validate";
import { registerHrSchema, loginSchema } from "../validators/authValidators";
import { registerHr, loginHr, refreshHrAccessToken, logoutHr } from "../controllers/hrAuthController";

const router = Router();

router.post("/register", authLimiter, validate(registerHrSchema), registerHr);
router.post("/login", authLimiter, validate(loginSchema), loginHr);
router.post("/refresh", refreshHrAccessToken);
router.post("/logout", logoutHr);

export default router;
