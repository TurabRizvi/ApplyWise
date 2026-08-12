import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";
import { AddTeamMemberInput } from "../validators/teamValidators";
import { logger } from "../utils/logger";

// IMPORTANT LIMITATION, stated plainly: this does NOT send an email
// invitation. There is no email-sending service wired into ApplyWise
// (no SMTP/SendGrid/etc configured). The ORG_ADMIN directly sets an email
// + password for the new recruiter here, and is expected to share those
// credentials with that person themselves (Slack, in person, however).
// A real "invite link" flow would need an email service added first —
// noted here rather than silently pretending this is a full invite system.
export const addTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const requestingHrUserId = req.auth!.userId;
  const { email, password } = req.body as AddTeamMemberInput;

  const requestingHrUser = await prisma.hrUser.findUnique({ where: { id: requestingHrUserId } });
  if (!requestingHrUser) throw new AppError("HR account not found", 404);

  // Only an ORG_ADMIN can add teammates — a RECRUITER growing their own
  // organization's user list would be a privilege-escalation risk.
  if (requestingHrUser.role !== "ORG_ADMIN") {
    throw new AppError("Only an organization admin can add team members", 403);
  }

  const existing = await prisma.hrUser.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Unable to add this team member with the provided details", 409);
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  const newRecruiter = await prisma.hrUser.create({
    data: {
      email,
      passwordHash,
      role: "RECRUITER",
      organizationId: requestingHrUser.organizationId,
    },
    select: { id: true, email: true, role: true, isActive: true, createdAt: true },
  });

  logger.info("Team member added", { newRecruiterId: newRecruiter.id, addedBy: requestingHrUserId });

  res.status(201).json({ success: true, data: newRecruiter });
});

export const listTeamMembers = asyncHandler(async (req: Request, res: Response) => {
  const hrUserId = req.auth!.userId;

  const hrUser = await prisma.hrUser.findUnique({ where: { id: hrUserId } });
  if (!hrUser) throw new AppError("HR account not found", 404);

  const teamMembers = await prisma.hrUser.findMany({
    where: { organizationId: hrUser.organizationId },
    select: { id: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  res.status(200).json({ success: true, data: teamMembers });
});

export const setTeamMemberActiveStatus = asyncHandler(async (req: Request, res: Response) => {
  const requestingHrUserId = req.auth!.userId;
  const { id: targetId } = req.params;
  const { isActive } = req.body as { isActive: boolean };

  const requestingHrUser = await prisma.hrUser.findUnique({ where: { id: requestingHrUserId } });
  if (!requestingHrUser) throw new AppError("HR account not found", 404);
  if (requestingHrUser.role !== "ORG_ADMIN") {
    throw new AppError("Only an organization admin can manage team members", 403);
  }

  const target = await prisma.hrUser.findUnique({ where: { id: targetId } });
  // Ownership check: the target must be in the SAME organization — an
  // ORG_ADMIN from Company A must never be able to deactivate someone at
  // Company B just by guessing/knowing their user id.
  if (!target || target.organizationId !== requestingHrUser.organizationId) {
    throw new AppError("Team member not found", 404);
  }

  if (target.id === requestingHrUserId && !isActive) {
    throw new AppError("You cannot deactivate your own account", 400);
  }

  const updated = await prisma.hrUser.update({
    where: { id: targetId },
    data: { isActive },
    select: { id: true, email: true, isActive: true },
  });

  res.status(200).json({ success: true, data: updated });
});
