import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { UpdateProfileInput } from "../validators/profileValidators";

// Note: we NEVER take a userId from the request body/params for these routes.
// The user identity comes only from `req.auth.userId`, which was set by
// `requireAuth` after verifying the JWT. This is what stops "IDOR" bugs
// (a user editing someone else's profile just by changing an ID in the URL).

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;

  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError("Profile not found", 404);
  }

  res.status(200).json({ success: true, data: profile });
});

export const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const updates = req.body as UpdateProfileInput;

  const profile = await prisma.profile.update({
    where: { userId },
    data: updates,
  });

  res.status(200).json({ success: true, data: profile });
});
