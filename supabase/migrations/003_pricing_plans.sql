-- Add plan_id column to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT NULL;

-- Create index for plan lookups
CREATE INDEX IF NOT EXISTS idx_stores_plan_id ON stores(plan_id);

-- Add comment for documentation
COMMENT ON COLUMN stores.plan_id IS 'Subscription plan: starter, standard, standard_founding, pro';
