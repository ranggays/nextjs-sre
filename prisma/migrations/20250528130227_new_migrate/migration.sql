/*
  Warnings:

  - You are about to drop the column `from` on the `Edge` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `Edge` table. All the data in the column will be lost.
  - Added the required column `updateAt` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromId` to the `Edge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toId` to the `Edge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Edge" DROP COLUMN "from",
DROP COLUMN "to",
ADD COLUMN     "fromId" INTEGER NOT NULL,
ADD COLUMN     "toId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
