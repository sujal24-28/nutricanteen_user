-- NutriCanteen Database Security & Performance Migration
-- Apply this script ONCE against the production/development MySQL database
-- to add missing security constraints and performance indexes.
-- Date: 2026-09-28
-- Version: 001

-- ============================================================
-- 1. SECURITY: Unique constraint on wallet_transactions.ref_id
--    Prevents duplicate payment credits (race condition / replay)
--    MySQL unique indexes allow multiple NULLs, so existing NULL rows are fine.
-- ============================================================
ALTER TABLE wallet_transactions
  ADD UNIQUE INDEX unique_wallet_ref_id (ref_id);

-- ============================================================
-- 2. PERFORMANCE: Index on otp_records.expires_at
--    Speeds up OTP lookup: WHERE is_used=false AND expires_at > NOW()
-- ============================================================
ALTER TABLE otp_records
  ADD INDEX idx_otp_expires_at (expires_at);

-- ============================================================
-- 3. PERFORMANCE: Index on orders.created_at
--    Speeds up date-range filtering in admin order sheet
-- ============================================================
ALTER TABLE orders
  ADD INDEX idx_orders_created_at (created_at);

-- ============================================================
-- 4. PERFORMANCE: Composite index on refresh_tokens
--    Speeds up: WHERE owner_id=? AND owner_type=? AND is_revoked=false
-- ============================================================
-- Drop old single-column index if it exists (may have been created by sequelize.sync)
-- ALTER TABLE refresh_tokens DROP INDEX IF EXISTS refresh_tokens_owner_id_owner_type;
ALTER TABLE refresh_tokens
  ADD INDEX idx_refresh_owner_active (owner_id, owner_type, is_revoked);

ALTER TABLE refresh_tokens
  ADD INDEX idx_refresh_expires (expires_at);

-- ============================================================
-- 5. PERFORMANCE: Index on wallet_transactions.ref_id
--    (Now covered by the unique index above, but listed for clarity)
-- ============================================================
-- Already covered by unique_wallet_ref_id above.

-- ============================================================
-- VERIFY: Check indexes were created
-- ============================================================
SHOW INDEX FROM wallet_transactions;
SHOW INDEX FROM otp_records;
SHOW INDEX FROM orders;
SHOW INDEX FROM refresh_tokens;
