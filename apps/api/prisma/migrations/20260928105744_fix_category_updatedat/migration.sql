/*
  Warnings:

  - You are about to drop the column `description` on the `expenses` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - Made the column `color` on table `categories` required. This step will fail if there are existing NULL values in that column.
  - Made the column `initial` on table `categories` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `month` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `expenses` table without a default value. This is not possible if the table is not empty.
  - Made the column `method` on table `expenses` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "expenses_userId_date_idx";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "color" SET NOT NULL,
ALTER COLUMN "color" SET DEFAULT 'terracotta',
ALTER COLUMN "initial" SET NOT NULL,
ALTER COLUMN "initial" SET DEFAULT 'G';

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "description",
ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL,
ALTER COLUMN "method" SET NOT NULL,
ALTER COLUMN "method" SET DEFAULT 'Card';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "name";

-- CreateIndex
CREATE INDEX "expenses_userId_year_month_idx" ON "expenses"("userId", "year", "month");
