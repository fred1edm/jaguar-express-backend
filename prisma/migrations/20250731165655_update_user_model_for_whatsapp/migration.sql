/*
  Warnings:

  - You are about to drop the column `detailedAddress` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `preferredPaymentMethod` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verificationCode` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verificationExpires` on the `users` table. All the data in the column will be lost.
  - Added the required column `acceptedTerms` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationLat` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationLng` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "detailedAddress",
DROP COLUMN "firstName",
DROP COLUMN "location",
DROP COLUMN "preferredPaymentMethod",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
DROP COLUMN "verificationCode",
DROP COLUMN "verificationExpires",
ADD COLUMN     "acceptedTerms" BOOLEAN NOT NULL,
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "locationLat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "locationLng" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "email" SET NOT NULL;
