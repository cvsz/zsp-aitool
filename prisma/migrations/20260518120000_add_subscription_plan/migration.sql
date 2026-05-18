-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO', 'TEAM', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "UserSetting"
ADD COLUMN "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE';
