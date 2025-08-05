-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPERADMIN', 'EDITOR', 'SOPORTE');

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastAccess" TIMESTAMP(3),
ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'SOPORTE';
