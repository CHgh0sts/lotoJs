/*
  Warnings:

  - The primary key for the `_GameToUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_GameToUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/

-- Add columns with default values first
ALTER TABLE "User" ADD COLUMN "email" TEXT;

-- Update existing rows with default values
UPDATE "User" SET "email" = CONCAT(LOWER("nom"), '.', LOWER("prenom"), '@example.com') WHERE "email" IS NULL;
UPDATE "User" SET "password" = 'defaultpassword123' WHERE "password" IS NULL;

-- Now make the columns required
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;

-- AlterTable
ALTER TABLE "_GameToUser" DROP CONSTRAINT "_GameToUser_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_GameToUser_AB_unique" ON "_GameToUser"("A", "B");
