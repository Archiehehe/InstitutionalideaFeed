-- Migration: Create all tables for Institutional Idea Feed
-- Run this in the Supabase SQL Editor

-- Sources
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'media',
  rss_url TEXT,
  sitemap_url TEXT,
  parser_type TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  quality_score INTEGER NOT NULL DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Articles
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  canonical_url TEXT,
  title TEXT NOT NULL,
  author TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_text TEXT,
  cleaned_text TEXT,
  paywall_status TEXT NOT NULL DEFAULT 'unknown',
  duplicate_key TEXT,
  article_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_score ON articles(article_score);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_duplicate_key ON articles(duplicate_key);

-- Article Extractions
CREATE TABLE IF NOT EXISTS article_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  firm TEXT,
  source_type TEXT,
  category TEXT,
  theme TEXT,
  sector TEXT,
  region TEXT,
  summary TEXT,
  reason_shown TEXT,
  extracted_tickers JSONB NOT NULL DEFAULT '[]',
  extracted_companies JSONB NOT NULL DEFAULT '[]',
  score_breakdown JSONB NOT NULL DEFAULT '{}',
  confidence REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_extractions_article ON article_extractions(article_id);

-- Ideas
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  company_name TEXT,
  exchange TEXT,
  country TEXT,
  sector TEXT,
  theme TEXT,
  confidence REAL NOT NULL DEFAULT 0,
  is_in_watchlist BOOLEAN NOT NULL DEFAULT false,
  is_in_portfolio BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ideas_ticker ON ideas(ticker);
CREATE INDEX IF NOT EXISTS idx_ideas_article ON ideas(article_id);

-- Baskets
CREATE TABLE IF NOT EXISTS baskets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  firm TEXT,
  theme TEXT,
  sector TEXT,
  region TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Basket Members
CREATE TABLE IF NOT EXISTS basket_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  basket_id UUID REFERENCES baskets(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  company_name TEXT,
  exchange TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_basket_members_basket ON basket_members(basket_id);

-- Watchlist
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  company_name TEXT,
  exchange TEXT,
  country TEXT,
  sector TEXT,
  source_article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  source_basket_id UUID REFERENCES baskets(id) ON DELETE SET NULL,
  theme TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_watchlist_ticker ON watchlist(ticker);

-- Metrics Snapshots
CREATE TABLE IF NOT EXISTS metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  provider TEXT NOT NULL,
  snapshot_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  price REAL,
  market_cap BIGINT,
  analyst_rating TEXT,
  avg_price_target REAL,
  implied_upside REAL,
  ath_price REAL,
  distance_from_ath REAL,
  high52_week REAL,
  low52_week REAL,
  revenue_growth REAL,
  valuation_json JSONB,
  earnings_date TEXT,
  insider_activity_json JSONB,
  raw_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_metrics_ticker ON metrics_snapshots(ticker);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON metrics_snapshots(snapshot_date DESC);

-- User Feedback
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scan Runs
CREATE TABLE IF NOT EXISTS scan_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  sources_checked INTEGER NOT NULL DEFAULT 0,
  urls_found INTEGER NOT NULL DEFAULT 0,
  articles_parsed INTEGER NOT NULL DEFAULT 0,
  articles_saved INTEGER NOT NULL DEFAULT 0,
  errors_json JSONB
);
