-- Add User.planTier safely for production databases that predate PlanTier.
-- This migration is idempotent so it can repair drifted environments without data loss.

DO $$
BEGIN
  CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO', 'TEAM', 'ENTERPRISE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "planTier" "PlanTier" NOT NULL DEFAULT 'FREE';
