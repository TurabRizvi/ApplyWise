import { prisma } from "../config/prisma";
import { AppError } from "./AppError";

// Used by EVERY route that touches a specific resume or its sub-sections
// (education, experience, etc). Confirms the resume both EXISTS and BELONGS
// to the requesting user, in one place.
//
// We return 404 ("not found"), never 403 ("forbidden"), when a resume
// exists but belongs to someone else. This is deliberate: a 403 confirms
// to an attacker that the ID they guessed is real, just not theirs — a 404
// gives away nothing. From the outside, "not yours" and "doesn't exist"
// should look identical.
export async function assertResumeOwnership(resumeId: string, userId: string) {
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });

  if (!resume || resume.userId !== userId) {
    throw new AppError("Resume not found", 404);
  }

  return resume;
}
