-- CreateTable
CREATE TABLE "Carton" (
    "id" SERIAL NOT NULL,
    "cartonId" TEXT NOT NULL,
    "listNumber" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Carton_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Carton_cartonId_key" ON "Carton"("cartonId");

-- AddForeignKey
ALTER TABLE "Carton" ADD CONSTRAINT "Carton_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
