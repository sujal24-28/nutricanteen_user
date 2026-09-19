# NutriCanteen optimization pass

This pass focuses on correctness, security, maintainability, and runtime behavior without redesigning the whole application.

## Changes made

### Backend
- Restricted CORS to `CORS_ORIGINS` instead of accepting every browser origin.
- Added the general API rate limiter to `/api/v1`.
- Reduced JSON/urlencoded request-body limits from 10 MB to 1 MB.
- Added graceful HTTP server + Sequelize shutdown handling.
- Added `uncaughtException`/`unhandledRejection` shutdown logging.
- Hardened uploads with MIME + extension allow-listing and randomized filenames.
- Disabled Razorpay mock behavior in production.
- Razorpay verification now validates the server-side order/payment and does not trust the browser-supplied amount.
- Added payment reference idempotency protection for repeated verification calls.
- Added OTP verification rate limiting and exact 6-digit validation.
- Fixed admin wallet permissions to use the actual `staff` role defined by the model.
- Unified order-list authentication through `protectAny`.
- Fixed student registration so an uploaded avatar is persisted.

### Frontend
- Removed the hard-coded admin password from the login screen.
- Replaced hard-coded public/LAN API addresses with `VITE_API_BASE_URL` and `VITE_NATIVE_API_BASE_URL` configuration, while retaining localhost/emulator fallbacks.
- Removed a duplicate hard-coded LAN host.
- Removed the fake ₹300 wallet fallback after profile completion; failed profile responses now fall back to ₹0 rather than inventing a balance.
- Added `frontend/.env.example`.

## Important deployment notes

1. The original project contained a real `node-backend/.env`. The optimized package intentionally does **not** include it. Create your own `.env` from `.env.example`.
2. If the original `.env` contained real database, JWT, MSG91, or Razorpay credentials, rotate those credentials before using them again.
3. Razorpay payment verification now requires real Razorpay credentials; configure them in `.env`.
4. The payment idempotency improvement uses the existing `wallet_transactions.ref_id` field. For a high-scale production deployment, add a dedicated `payment_id` column with a unique database constraint through a proper migration.
5. `sequelize.sync()` is convenient for development but should be replaced with versioned migrations before production schema changes.
6. Run dependency installation from fresh `package-lock.json` files rather than copying `node_modules` from another operating system.

## Validation performed

- All backend/frontend JavaScript and JSX source files parsed successfully with Babel parser.
- Backend files modified in this pass pass `node --check` syntax validation.
- The supplied dependency folders in the uploaded ZIP were not reliable for a full build/test run: the frontend Rollup native optional dependency is missing, and the bundled Jest setup cannot be resolved by the supplied Jest installation. These are dependency/environment issues, not source syntax errors.
