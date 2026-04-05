-- ═══════════════════════════════════════════════════════
-- Pre-Worshipped: Supabase Database Schema
-- Run this in your Supabase SQL Editor (supabase.com → project → SQL Editor)
-- ═══════════════════════════════════════════════════════

-- 1. Cars table — main listing store
CREATE TABLE IF NOT EXISTS cars (
  id TEXT PRIMARY KEY,
  model TEXT NOT NULL,
  variant TEXT DEFAULT '',
  year INTEGER NOT NULL,
  km INTEGER DEFAULT 0,
  price INTEGER NOT NULL,
  fuel TEXT DEFAULT 'Petrol',
  transmission TEXT DEFAULT 'Manual',
  body_type TEXT DEFAULT 'SUV',
  drivetrain TEXT DEFAULT '2WD',
  owners INTEGER DEFAULT 1,
  reg_state TEXT DEFAULT '',
  city TEXT DEFAULT '',
  color TEXT DEFAULT '',
  source TEXT DEFAULT '',
  certified BOOLEAN DEFAULT FALSE,
  link TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  stage TEXT DEFAULT 'discovered',
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Preferences table — user preferences
CREATE TABLE IF NOT EXISTS preferences (
  id TEXT PRIMARY KEY DEFAULT 'default',
  budget_min INTEGER DEFAULT 800000,
  budget_max INTEGER DEFAULT 1600000,
  fuel_pref TEXT[] DEFAULT '{Diesel,Petrol}',
  body_types TEXT[] DEFAULT '{SUV}',
  transmission TEXT DEFAULT 'Any',
  max_km INTEGER DEFAULT 120000,
  max_age INTEGER DEFAULT 9,
  max_owners INTEGER DEFAULT 2,
  wants_mods BOOLEAN DEFAULT TRUE,
  wants_4x4 BOOLEAN DEFAULT TRUE,
  base_city TEXT DEFAULT 'Chennai',
  search_radius INTEGER DEFAULT 600,
  diesel_hunter BOOLEAN DEFAULT TRUE,
  min_displacement INTEGER DEFAULT 2000,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI Analysis results — cached per car
CREATE TABLE IF NOT EXISTS ai_analysis (
  car_id TEXT PRIMARY KEY REFERENCES cars(id) ON DELETE CASCADE,
  verdict TEXT,
  confidence INTEGER,
  summary TEXT,
  hidden_costs TEXT,
  negotiation_tip TEXT,
  check_these TEXT,
  long_term TEXT,
  fair_price TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Checklist progress — per car, per item
CREATE TABLE IF NOT EXISTS checklist (
  id TEXT PRIMARY KEY, -- format: carId-category-item
  car_id TEXT REFERENCES cars(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  checked BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Scrape log — track scraping history
CREATE TABLE IF NOT EXISTS scrape_log (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  cars_found INTEGER DEFAULT 0,
  error TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ─── Indexes for performance ───
CREATE INDEX IF NOT EXISTS idx_cars_source ON cars(source);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_fuel ON cars(fuel);
CREATE INDEX IF NOT EXISTS idx_cars_stage ON cars(stage);
CREATE INDEX IF NOT EXISTS idx_cars_city ON cars(city);
CREATE INDEX IF NOT EXISTS idx_checklist_car ON checklist(car_id);

-- ─── Insert default preferences ───
INSERT INTO preferences (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- ─── RLS Policies — REQUIRED for anon key access ───
-- Since this is a single-user personal app, we allow all operations

ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on cars" ON cars FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on preferences" ON preferences FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on ai_analysis" ON ai_analysis FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on checklist" ON checklist FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE scrape_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on scrape_log" ON scrape_log FOR ALL USING (true) WITH CHECK (true);
