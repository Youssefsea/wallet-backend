-- ============================================
-- WealthWise AI - Database Schema (PostgreSQL)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- 1. USERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =====================
-- 2. WALLETS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15, 2) DEFAULT 0.00 CHECK (balance >= -1000),
    currency VARCHAR(10) DEFAULT 'EGP',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);

-- =====================
-- 3. CATEGORIES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'both'))
);

-- Default categories
INSERT INTO categories (name, icon, type) VALUES
    ('Food & Drinks',     '🍔', 'expense'),
    ('Transportation',    '🚗', 'expense'),
    ('Shopping',          '🛒', 'expense'),
    ('Entertainment',     '🎬', 'expense'),
    ('Utilities',         '💡', 'expense'),
    ('Healthcare',        '🏥', 'expense'),
    ('Education',         '📚', 'expense'),
    ('Housing',           '🏠', 'expense'),
    ('Salary',            '💰', 'income'),
    ('Freelance',         '💻', 'income'),
    ('Investment',        '📈', 'both'),
    ('Other',             '📦', 'both')
ON CONFLICT DO NOTHING;

-- =====================
-- 4. TRANSACTIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id),
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('deposit', 'withdraw', 'transfer', 'manual_expense', 'manual_income', 'ai_expense', 'ai_income')),
    description TEXT,
    idempotency_key VARCHAR(255) UNIQUE,
    is_synced BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
    ai_metadata JSONB,  -- Store original AI text + parsed result
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_idempotency ON transactions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

-- =====================
-- 5. BUDGETS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id),
    limit_amount DECIMAL(15, 2) NOT NULL CHECK (limit_amount > 0),
    current_spent DECIMAL(15, 2) DEFAULT 0.00,
    month_year VARCHAR(7) NOT NULL,  -- Format: '2026-03'
    UNIQUE(user_id, category_id, month_year)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_budgets_user_cat_month ON budgets(user_id, category_id, month_year);
