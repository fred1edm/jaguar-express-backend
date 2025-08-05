/*
  Warnings:

  - You are about to drop the column `image` on the `businesses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "businesses" DROP COLUMN "image",
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "menuImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
