/*
  Warnings:

  - The primary key for the `Article` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fileName` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Article` table. All the data in the column will be lost.
  - The `id` column on the `Article` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Edge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sourceId` on the `Edge` table. All the data in the column will be lost.
  - You are about to drop the column `targetId` on the `Edge` table. All the data in the column will be lost.
  - The `id` column on the `Edge` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Node` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `title` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `articleId` to the `Edge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `from` to the `Edge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `Edge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Node` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `articleId` on the `Node` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Edge" DROP CONSTRAINT "Edge_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "Edge" DROP CONSTRAINT "Edge_targetId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_articleId_fkey";

-- AlterTable
ALTER TABLE "Article" DROP CONSTRAINT "Article_pkey",
DROP COLUMN "fileName",
DROP COLUMN "status",
ADD COLUMN     "title" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Article_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Edge" DROP CONSTRAINT "Edge_pkey",
DROP COLUMN "sourceId",
DROP COLUMN "targetId",
ADD COLUMN     "articleId" INTEGER NOT NULL,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "from" INTEGER NOT NULL,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "to" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "relation" DROP NOT NULL,
ADD CONSTRAINT "Edge_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Node" DROP CONSTRAINT "Node_pkey",
ADD COLUMN     "att_background" TEXT,
ADD COLUMN     "att_future" TEXT,
ADD COLUMN     "att_gaps" TEXT,
ADD COLUMN     "att_goal" TEXT,
ADD COLUMN     "att_method" TEXT,
ADD COLUMN     "att_url" TEXT,
ADD COLUMN     "label" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
DROP COLUMN "articleId",
ADD COLUMN     "articleId" INTEGER NOT NULL,
ADD CONSTRAINT "Node_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
