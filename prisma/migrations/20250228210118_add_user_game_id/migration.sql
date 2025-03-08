/*
  Warnings:

  - A unique constraint covering the columns `[userGameId]` on the table `UserGame` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userGameId` to the `UserGame` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserGame" ADD COLUMN     "userGameId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserGame_userGameId_key" ON "UserGame"("userGameId");
