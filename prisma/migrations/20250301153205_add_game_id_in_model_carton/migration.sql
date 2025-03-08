/*
  Warnings:

  - Added the required column `gameId` to the `Carton` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Carton" ADD COLUMN     "gameId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Carton" ADD CONSTRAINT "Carton_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
