-- FeeLens database schema

CREATE TABLE IF NOT EXISTS stripe_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_key TEXT NOT NULL,
  is_test_mode BOOLEAN NOT NULL DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS balance_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_date DATE NOT NULL,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  fee INTEGER NOT NULL,
  net INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  source_id TEXT,
  card_brand TEXT,
  card_country TEXT,
  is_international BOOLEAN DEFAULT false,
  payment_method_type TEXT,
  month_bucket TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bt_user_month ON balance_transactions(user_id, month_bucket);
CREATE INDEX IF NOT EXISTS idx_bt_user_type ON balance_transactions(user_id, type);

CREATE TABLE IF NOT EXISTS refund_fee_leakage (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  charge_id TEXT NOT NULL,
  original_fee_paid INTEGER NOT NULL,
  refund_date DATE NOT NULL,
  month_bucket TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rfl_user_month ON refund_fee_leakage(user_id, month_bucket);

CREATE TABLE IF NOT EXISTS dispute_records (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  charge_id TEXT NOT NULL,
  dispute_fee INTEGER NOT NULL DEFAULT 1500,
  status TEXT NOT NULL,
  dispute_date DATE NOT NULL,
  month_bucket TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dr_user_month ON dispute_records(user_id, month_bucket);

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ DEFAULT now(),
  month_bucket TEXT NOT NULL,
  recommendations JSONB NOT NULL,
  input_hash TEXT NOT NULL,
  UNIQUE(user_id, month_bucket, input_hash)
);

-- Row Level Security
ALTER TABLE stripe_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_fee_leakage ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their stripe connections" ON stripe_connections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their transactions" ON balance_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their leakage records" ON refund_fee_leakage FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their dispute records" ON dispute_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their recommendations" ON ai_recommendations FOR ALL USING (auth.uid() = user_id);
