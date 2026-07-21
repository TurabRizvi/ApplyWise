-- CreateTable
CREATE TABLE "HrRefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "hrUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HrRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HrRefreshToken_tokenHash_key" ON "HrRefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "HrRefreshToken_hrUserId_idx" ON "HrRefreshToken"("hrUserId");

-- AddForeignKey
ALTER TABLE "HrRefreshToken" ADD CONSTRAINT "HrRefreshToken_hrUserId_fkey" FOREIGN KEY ("hrUserId") REFERENCES "HrUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
