-- CreateTable
CREATE TABLE "ApiCallLog" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiCallLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiCallLog_provider_createdAt_idx" ON "ApiCallLog"("provider", "createdAt");

-- CreateTable
CREATE TABLE "ApiLimitSnapshot" (
    "provider" TEXT NOT NULL,
    "limit" INTEGER,
    "remaining" INTEGER,
    "resetAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiLimitSnapshot_pkey" PRIMARY KEY ("provider")
);
