-- CreateTable
CREATE TABLE "WorkSpace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkSpace_pkey" PRIMARY KEY ("id")
);
