-- Add Stripe subscription columns to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT NULL;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ DEFAULT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stores_stripe_customer_id ON stores(stripe_customer_id);
