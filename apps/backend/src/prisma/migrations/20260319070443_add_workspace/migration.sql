/*
  Warnings:

  - You are about to drop the `WorkSpace` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "WorkSpace";

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);
