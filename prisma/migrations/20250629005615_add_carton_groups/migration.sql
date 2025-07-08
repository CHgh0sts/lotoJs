-- AlterTable
ALTER TABLE "Carton" ADD COLUMN     "groupId" INTEGER;

-- CreateTable
CREATE TABLE "CartonGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "gameId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartonGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Carton" ADD CONSTRAINT "Carton_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "CartonGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartonGroup" ADD CONSTRAINT "CartonGroup_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
