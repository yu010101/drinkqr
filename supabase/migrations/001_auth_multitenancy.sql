-- ============================================
-- DrinkQR 認証 + マルチテナント対応
-- ============================================

-- 店舗テーブル
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL, -- URL用のスラッグ (例: izakaya-tanaka)
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- メニューテーブル（店舗ごと）
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  price INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 既存のordersテーブルにstore_id追加
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;

-- 既存のprint_jobsテーブルにstore_id追加
ALTER TABLE print_jobs ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;

-- インデックス
CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_menus_store ON menus(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_store ON print_jobs(store_id);

-- RLS (Row Level Security) ポリシー
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;

-- 店舗: オーナーのみ読み書き可能
CREATE POLICY "stores_owner_select" ON stores FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "stores_owner_insert" ON stores FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "stores_owner_update" ON stores FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "stores_owner_delete" ON stores FOR DELETE USING (owner_id = auth.uid());

-- メニュー: 店舗オーナーは読み書き可能、一般ユーザーは読み取りのみ
CREATE POLICY "menus_owner_all" ON menus FOR ALL USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = menus.store_id AND stores.owner_id = auth.uid())
);
CREATE POLICY "menus_public_read" ON menus FOR SELECT USING (true);

-- 注文: 店舗オーナーは読み取り可能、誰でも作成可能
CREATE POLICY "orders_owner_select" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid())
);
CREATE POLICY "orders_public_insert" ON orders FOR INSERT WITH CHECK (true);

-- 印刷ジョブ: 店舗オーナーのみ
CREATE POLICY "print_jobs_owner_all" ON print_jobs FOR ALL USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = print_jobs.store_id AND stores.owner_id = auth.uid())
);

-- 公開用: スラッグからstore_idを取得する関数
CREATE OR REPLACE FUNCTION get_store_id_by_slug(store_slug TEXT)
RETURNS UUID AS $$
  SELECT id FROM stores WHERE slug = store_slug LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 公開用: 店舗のメニューを取得（認証不要）
CREATE OR REPLACE FUNCTION get_public_menu(store_slug TEXT)
RETURNS TABLE (
  name TEXT,
  category TEXT,
  price INTEGER,
  is_available BOOLEAN
) AS $$
  SELECT m.name, m.category, m.price, m.is_available
  FROM menus m
  JOIN stores s ON s.id = m.store_id
  WHERE s.slug = store_slug AND m.is_available = true
  ORDER BY m.sort_order, m.name;
$$ LANGUAGE sql SECURITY DEFINER;
