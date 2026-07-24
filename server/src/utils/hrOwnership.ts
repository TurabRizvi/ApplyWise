import { prisma } from "../config/prisma";
import { AppError } from "./AppError";

// Same idea as assertResumeOwnership from Day 3, but for HR: confirms a
// screening batch belongs to the SAME organization as the requesting HR
// user — not just "some HR account", since two different companies using
// this platform must never be able to see each other's candidate pools.
export async function assertBatchOwnership(batchId: string, hrUserId: string) {
  const hrUser = await prisma.hrUser.findUnique({ where: { id: hrUserId } });
  if (!hrUser) {
    throw new AppError("HR account not found", 404);
  }

  const batch = await prisma.screeningBatch.findUnique({ where: { id: batchId } });
  if (!batch || batch.organizationId !== hrUser.organizationId) {
    throw new AppError("Screening batch not found", 404);
  }

  return { batch, hrUser };
}
