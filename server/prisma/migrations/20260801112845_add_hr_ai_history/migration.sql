-- CreateTable
CREATE TABLE "HrAiHistory" (
    "id" TEXT NOT NULL,
    "hrUserId" TEXT NOT NULL,
    "featureType" TEXT NOT NULL,
    "inputSummary" TEXT NOT NULL,
    "outputSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HrAiHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HrAiHistory_hrUserId_idx" ON "HrAiHistory"("hrUserId");

-- AddForeignKey
ALTER TABLE "HrAiHistory" ADD CONSTRAINT "HrAiHistory_hrUserId_fkey" FOREIGN KEY ("hrUserId") REFERENCES "HrUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
