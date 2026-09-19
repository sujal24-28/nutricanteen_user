# 🍱 NutriCanteen Backend

> **A Node.js + MySQL monolith backend for a school canteen pre-order system.**  
> Students pre-order food from home before coming to school, pay via an in-app wallet topped up through OTP verification (MSG91).

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Architecture](#architecture)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)
8. [Authentication & Authorization](#authentication--authorization)
9. [Wallet System](#wallet-system)
10. [OTP Flow (MSG91)](#otp-flow-msg91)
11. [Order Lifecycle](#order-lifecycle)
12. [Getting Started](#getting-started)
13. [Environment Variables](#environment-variables)
14. [Error Handling](#error-handling)
15. [Security Measures](#security-measures)
16. [Logging](#logging)

---

## Overview

NutriCanteen allows school students to browse the canteen menu, add items to their cart, and place orders **before arriving at school** — eliminating queues at the canteen. Payment is exclusively through an **in-app wallet**. Wallet top-ups require OTP verification via **MSG91** to prevent unauthorized credits.

A canteen admin panel (separate frontend) allows staff to manage the menu, view incoming orders, and update order statuses in real time.

---

## Features

- 🎓 **Student Identity** — Unique ID is the composite of `name + class + roll + section`
- 📱 **OTP Login** — Students log in via phone number + MSG91 OTP (no password)
- 💰 **In-App Wallet** — Sole payment method; every debit/credit is immutably recorded
- 🔒 **OTP-Verified Top-Up** — Wallet credits only after MSG91 OTP confirmation
- 🛒 **Cart → Order** — Atomic order placement deducts wallet and records the order in a single DB transaction
- ↩️ **Auto-Refund on Cancel** — Cancelling a pending order instantly refunds the wallet
- 👨‍💼 **Admin Panel API** — Role-based admin (superadmin / staff) for menu & order management
- 📜 **Wallet Ledger** — Full immutable transaction history with balance snapshots
- 🔄 **Token Rotation** — Access + refresh JWT tokens with rotation on each refresh
- 🛡️ **Rate Limiting** — Strict limiter on OTP endpoints (5 req per 15 min per phone)
- 📸 **Menu Images** — Upload item images via multipart/form-data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 |
| Web Framework | Express.js 4 |
| ORM | Sequelize 6 |
| Database | MySQL 8 |
| Auth | JWT (jsonwebtoken) |
| OTP Service | MSG91 REST API |
| Password/OTP Hashing | bcryptjs |
| Validation | express-validator |
| File Uploads | multer |
| HTTP Client | axios (for MSG91) |
| Security | helmet, cors, express-rate-limit |
| Logging | winston + morgan |

---

## Project Structure

```
node-backend/
├── server.js                    # Entry point — starts DB + HTTP server
├── src/
│   ├── app.js                   # Express app setup (middleware, routes)
│   │
│   ├── config/
│   │   ├── database.js          # Sequelize instance + connectDB()
│   │   ├── msg91.js             # MSG91 API configuration
│   │   └── index.js             # Config barrel export
│   │
│   ├── models/
│   │   ├── Student.model.js     # Student entity (composite unique ID)
│   │   ├── Admin.model.js       # Canteen admin users
│   │   ├── OtpRecord.model.js   # OTP storage (hashed, TTL, attempts)
│   │   ├── MenuItem.model.js    # Canteen food items
│   │   ├── Cart.model.js        # Student shopping cart
│   │   ├── Order.model.js       # Placed orders
│   │   ├── OrderItem.model.js   # Line items per order (price snapshot)
│   │   ├── WalletTransaction.model.js  # Immutable wallet ledger
│   │   ├── RefreshToken.model.js       # JWT refresh token store
│   │   └── index.js             # Model imports + all associations
│   │
│   ├── services/                # Business logic layer
│   │   ├── auth.service.js      # Registration, OTP login, token rotation
│   │   ├── student.service.js   # Profile management
│   │   ├── wallet.service.js    # Balance, top-up with OTP
│   │   ├── menu.service.js      # Menu CRUD + image management
│   │   ├── cart.service.js      # Cart operations
│   │   ├── order.service.js     # Atomic order placement, status, cancel
│   │   └── admin.service.js     # Student mgmt, dashboard, admin creation
│   │
│   ├── controllers/             # HTTP layer — calls services, returns JSON
│   │   ├── auth.controller.js
│   │   ├── student.controller.js
│   │   ├── wallet.controller.js
│   │   ├── menu.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   └── admin.controller.js
│   │
│   ├── routes/                  # Express routers with validators
│   │   ├── auth.routes.js
│   │   ├── student.routes.js
│   │   ├── wallet.routes.js
│   │   ├── menu.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── admin.routes.js
│   │   └── index.js             # Mounts all routers under /api/v1
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js       # JWT verification (protect / protectAdmin)
│   │   ├── role.middleware.js       # requireRole(...roles)
│   │   ├── validate.middleware.js   # express-validator error handler
│   │   ├── upload.middleware.js     # multer (images only, configurable size)
│   │   ├── rateLimiter.middleware.js # OTP limiter + general API limiter
│   │   ├── error.middleware.js      # Global error formatter
│   │   └── notFound.middleware.js   # 404 handler
│   │
│   └── utils/
│       ├── response.util.js     # successResponse / errorResponse helpers
│       ├── jwt.util.js          # Token generation & verification
│       ├── otp.util.js          # generateOtp / hashOtp / compareOtp
│       ├── msg91.util.js        # MSG91 REST API caller
│       ├── logger.util.js       # Winston logger (console + file)
│       └── pagination.util.js   # parsePagination / paginationMeta
│
├── uploads/                     # Uploaded menu images (git-ignored)
├── logs/                        # Winston log files (git-ignored)
├── .env.example                 # Template for environment variables
├── .gitignore
└── package.json
```

---

## Architecture

```
Client (Mobile App)
        │
        │ HTTP/JSON
        ▼
┌─────────────────────────────────────────────────────────┐
│                    Express.js App                        │
│                                                          │
│  ┌──────────────┐   ┌─────────────┐   ┌──────────────┐ │
│  │  Middlewares  │──▶│   Routes    │──▶│ Controllers  │ │
│  │  (helmet,     │   │ (validators)│   │  (thin HTTP) │ │
│  │  cors, auth,  │   └─────────────┘   └──────┬───────┘ │
│  │  rate-limit)  │                            │         │
│  └──────────────┘                            ▼         │
│                                    ┌──────────────────┐ │
│                                    │    Services      │ │
│                                    │  (business logic)│ │
│                                    └────────┬─────────┘ │
│                                             │           │
│                                    ┌────────▼─────────┐ │
│                                    │   Sequelize ORM  │ │
│                                    └────────┬─────────┘ │
└─────────────────────────────────────────────┼───────────┘
                                              │
                                    ┌─────────▼──────────┐
                                    │     MySQL 8         │
                                    └────────────────────┘
                                              │
                                    External Services:
                                    └─ MSG91 (OTP SMS)
```

**Data flow rule:** `Routes → Controllers → Services → Models`  
Controllers never query the DB directly. Services never touch `req`/`res`.

---

## Database Schema

### `students`
| Column | Type | Notes |
|---|---|---|
| id | INT UNSIGNED PK | Auto-increment |
| name | VARCHAR(100) | Part of composite unique key |
| class | VARCHAR(20) | e.g. "10", "11A" — part of composite key |
| roll | VARCHAR(20) | Part of composite unique key |
| section | VARCHAR(10) | e.g. "A", "B" — part of composite key |
| phone | VARCHAR(15) UNIQUE | 10-digit, used for OTP login |
| wallet_balance | DECIMAL(10,2) | Current balance in INR |
| is_active | BOOLEAN | Soft disable by admin |
| deleted_at | DATETIME | Soft delete (paranoid) |
| created_at / updated_at | DATETIME | Auto-managed |

> **Unique constraint:** `(name, class, roll, section)` — the student's composite identity

### `admins`
| Column | Type | Notes |
|---|---|---|
| id | INT UNSIGNED PK | |
| name | VARCHAR(100) | |
| email | VARCHAR(150) UNIQUE | Login email |
| password_hash | VARCHAR(255) | bcrypt hash |
| role | ENUM | `superadmin` \| `staff` |
| is_active | BOOLEAN | |

### `otp_records`
| Column | Type | Notes |
|---|---|---|
| id | INT UNSIGNED PK | |
| phone | VARCHAR(15) | |
| otp_hash | VARCHAR(255) | bcrypt hash of OTP |
| purpose | ENUM | `login` \| `topup` |
| expires_at | DATETIME | OTP TTL |
| is_used | BOOLEAN | Marked true on use |
| attempts | TINYINT | Failed attempts counter |

### `menu_items`
| Column | Type | Notes |
|---|---|---|
| id | INT UNSIGNED PK | |
| name | VARCHAR(150) | |
| description | TEXT | Optional |
| price | DECIMAL(8,2) | |
| category | VARCHAR(50) | Breakfast / Lunch / Snacks / Beverages |
| image_url | VARCHAR(500) | Relative URL to uploaded image |
| is_available | BOOLEAN | Toggle visibility |
| daily_limit | INT UNSIGNED | NULL = unlimited |
| deleted_at | DATETIME | Soft delete |

### `carts`
| Column | Type | Notes |
|---|---|---|
| id | INT UNSIGNED PK | |
| student_id | FK → students | |
| item_id | FK → menu_items | |
| quantity | TINYINT(1–20) | |
> **Unique:** `(student_id, item_id)` — enables upsert

### `orders`
| Column | Type | Notes |
|---|---|---|
| id | INT UNSIGNED PK | |
| student_id | FK → students | |
| total_amount | DECIMAL(10,2) | |
| status | ENUM | `pending → confirmed → ready → delivered` |
| pickup_time | DATETIME | Requested by student |
| note | VARCHAR(300) | Note to canteen |
| cancelled_at | DATETIME | If cancelled |
| cancel_reason | VARCHAR(200) | |

### `order_items`
| Column | Type | Notes |
|---|---|---|
| id | INT UNSIGNED PK | |
| order_id | FK → orders | |
| item_id | FK → menu_items | |
| quantity | TINYINT | |
| unit_price | DECIMAL(8,2) | **Price snapshot** at order time |

### `wallet_transactions`
| Column | Type | Notes |
|---|---|---|
| id | INT UNSIGNED PK | |
| student_id | FK → students | |
| type | ENUM | `credit` \| `debit` |
| amount | DECIMAL(10,2) | |
| balance_after | DECIMAL(10,2) | Balance snapshot after this transaction |
| ref_id | VARCHAR(100) | order_id or topup reference |
| description | VARCHAR(255) | Human-readable description |
| created_at | DATETIME | Immutable — no `updated_at` |

### `refresh_tokens`
| Column | Type | Notes |
|---|---|---|
| id | INT UNSIGNED PK | |
| owner_id | INT UNSIGNED | student or admin ID |
| owner_type | ENUM | `student` \| `admin` |
| token_hash | VARCHAR(255) UNIQUE | SHA-256 of raw token |
| expires_at | DATETIME | |
| is_revoked | BOOLEAN | Rotation/logout flag |

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Health Check
```
GET /health
```
Returns `{ status: "ok", timestamp: "..." }`

---

### 🔐 Auth — `/api/v1/auth`

#### Student Registration
```
POST /auth/student/register
Body: { name, class, roll, section, phone }
Response: 201 { student }
```

#### Send Login OTP
```
POST /auth/student/send-otp
Body: { phone }
Response: 200 { message }
Rate-limited: 5 requests per 15 minutes per phone
```

#### Verify OTP & Login
```
POST /auth/student/verify-otp
Body: { phone, otp }
Response: 200 { accessToken, refreshToken, student }
```

#### Refresh Access Token
```
POST /auth/student/refresh
Body: { refresh_token }
Response: 200 { accessToken, refreshToken }
```

#### Logout
```
POST /auth/student/logout
Body: { refresh_token }
Response: 200
```

#### Admin Login
```
POST /auth/admin/login
Body: { email, password }
Response: 200 { accessToken, refreshToken, admin }
```

---

### 👤 Student — `/api/v1/student` *(Auth required)*

```
GET  /student/profile          → Get own profile
PUT  /student/profile          → Update phone number
     Body: { phone }
```

---

### 💳 Wallet — `/api/v1/wallet` *(Auth required)*

```
GET  /wallet                   → Balance + paginated transactions
     Query: ?page=1&limit=20

POST /wallet/topup/send-otp    → Send top-up OTP
     Body: { amount }
     Rate-limited

POST /wallet/topup/verify      → Verify OTP → credit wallet
     Body: { otp, amount }
```

---

### 🍔 Menu — `/api/v1/menu`

```
GET  /menu                     → List available items (public)
     Query: ?category=Lunch&search=biryani&page=1&limit=20

GET  /menu/:id                 → Get single item (public)

POST /menu                     → Create item (admin)
     multipart/form-data: { name, price, category, description, daily_limit, image }

PUT  /menu/:id                 → Update item (admin)
     multipart/form-data: same fields (all optional)

DELETE /menu/:id               → Soft-delete item (admin)
```

---

### 🛒 Cart — `/api/v1/cart` *(Auth required)*

```
GET    /cart                   → Get cart with subtotal
POST   /cart                   → Add/update item
       Body: { item_id, quantity }
DELETE /cart/:itemId           → Remove one item
DELETE /cart                   → Clear entire cart
```

---

### 📦 Orders — `/api/v1/orders`

```
POST   /orders                 → Place order from cart (student)
       Body: { pickupTime?, note? }
       Atomically: deducts wallet + creates order + clears cart

GET    /orders                 → List orders
       Students: own orders only
       Admin: all orders
       Query: ?status=pending&page=1&limit=20

GET    /orders/:id             → Get order detail

PATCH  /orders/:id/status      → Update status (admin only)
       Body: { status: "confirmed"|"ready"|"delivered"|"cancelled" }

POST   /orders/:id/cancel      → Cancel order (student, pending only)
       Automatically refunds wallet
```

---

### 🔧 Admin — `/api/v1/admin` *(Admin auth required)*

```
GET    /admin/dashboard                  → Summary stats
GET    /admin/students                   → List students
       Query: ?search=&class=10&section=A
GET    /admin/students/:id               → Student detail + wallet summary
POST   /admin/students/:id/credit        → Credit wallet (superadmin)
       Body: { amount, description? }
PATCH  /admin/students/:id/status        → Toggle active/inactive (superadmin)
POST   /admin/admins                     → Create admin account (superadmin)
       Body: { name, email, password, role }
```

---

## Authentication & Authorization

### Token Strategy

| Token | Lifetime | Storage | Purpose |
|---|---|---|---|
| Access Token (JWT) | 15 minutes | Client memory | Sent as `Authorization: Bearer <token>` |
| Refresh Token (JWT) | 7 days | DB (hashed) + client | Exchange for new access token |

### Roles
| Role | Can do |
|---|---|
| `student` | Browse menu, manage cart, place orders, top-up wallet |
| `staff` | View/update orders, view students |
| `superadmin` | Everything staff can + credit wallets, toggle student accounts, create admins |

### Token Rotation
On every `/refresh` call, the old refresh token is **revoked** and a brand-new pair is issued. This means each refresh token is single-use.

---

## Wallet System

The wallet is the **only payment method**. Key design principles:

1. **Atomic Operations** — Every balance change happens inside a Sequelize DB transaction. If any part fails, the entire transaction rolls back.
2. **Immutable Ledger** — `wallet_transactions` rows are never updated. Each row captures `balance_after` as a snapshot.
3. **No Direct Balance Updates** — The code always: `INSERT wallet_transaction` + `UPDATE student.wallet_balance` together in one transaction.
4. **Refund on Cancel** — Cancelling a `pending` order atomically credits the wallet back.

### Wallet Flow
```
Top-Up Request:
  Student → POST /wallet/topup/send-otp { amount }
          ← OTP sent via MSG91

  Student → POST /wallet/topup/verify { otp, amount }
          ← Wallet credited + WalletTransaction created

Order Payment:
  Student → POST /orders
          ← Cart items validated
          ← Wallet balance checked
          ← DB Transaction:
               UPDATE students SET wallet_balance = balance - total
               INSERT order + order_items
               INSERT wallet_transaction (debit)
               DELETE cart items
          ← Order confirmed
```

---

## OTP Flow (MSG91)

### Setup
1. Create an account at [MSG91](https://msg91.com)
2. Create two SMS templates:
   - **Login OTP** — include `{{otp}}` variable
   - **Top-up OTP** — include `{{otp}}` variable
3. Copy the template IDs to `.env`

### Security Design
- OTPs are **6 digits**, cryptographically random (`crypto.randomInt`)
- Stored as **bcrypt hashes** — plaintext never touches the DB
- OTP TTL: **10 minutes** (configurable via `OTP_EXPIRES_MINUTES`)
- **5 failed attempts** → OTP is invalidated, must request new one
- Sending a new OTP **invalidates all previous unused OTPs** for that phone
- OTP send endpoint is **rate-limited**: 5 requests per 15 minutes per phone number

---

## Order Lifecycle

```
pending → confirmed → ready → delivered
    └──────────────────────────→ cancelled (by student, only if pending)
                                 (wallet refunded automatically)
```

| Transition | Who |
|---|---|
| `pending → confirmed` | Admin (staff / superadmin) |
| `confirmed → ready` | Admin |
| `ready → delivered` | Admin |
| `pending → cancelled` | **Student** (with wallet refund) or Admin |
| Any → `cancelled` | Admin |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MySQL 8 running locally or remotely
- MSG91 account (for OTP; see [MSG91 OTP Flow](#otp-flow-msg91))

### 1. Clone and Install
```bash
cd "d:\food delivery app\node-backend"
npm install
```

### 2. Configure Environment
```bash
copy .env.example .env
# Edit .env with your MySQL credentials, JWT secrets, and MSG91 keys
```

### 3. Create the Database
```sql
CREATE DATABASE nutricanteen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Start the Server
```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

The server will:
1. Connect to MySQL
2. Auto-create/update all tables (`sequelize.sync({ alter: true })` in dev)
3. Start listening on `http://localhost:5000`

### 5. Seed the First Superadmin
The system has no built-in seeder, so create the first superadmin directly in MySQL:
```sql
-- bcrypt hash for "Admin@1234" (12 rounds)
INSERT INTO admins (name, email, password_hash, role, is_active, created_at, updated_at)
VALUES (
  'Super Admin',
  'admin@nutricanteen.com',
  '$2a$12$<your_bcrypt_hash>',
  'superadmin',
  1,
  NOW(), NOW()
);
```
Or generate a bcrypt hash using Node.js:
```js
const bcrypt = require('bcryptjs');
bcrypt.hash('Admin@1234', 12).then(console.log);
```
Then use `POST /api/v1/admin/admins` to create additional admins via the API.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | `development` or `production` | `development` |
| `PORT` | HTTP port | `5000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | — |
| `DB_USER` | MySQL user | — |
| `DB_PASSWORD` | MySQL password | — |
| `JWT_ACCESS_SECRET` | Secret for access tokens (min 32 chars) | — |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars) | — |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `MSG91_AUTH_KEY` | MSG91 API authentication key | — |
| `MSG91_SENDER_ID` | 6-char sender ID | `NTRCNT` |
| `MSG91_LOGIN_TEMPLATE_ID` | MSG91 template ID for login OTP | — |
| `MSG91_TOPUP_TEMPLATE_ID` | MSG91 template ID for top-up OTP | — |
| `OTP_EXPIRES_MINUTES` | OTP validity duration | `10` |
| `OTP_LENGTH` | Number of OTP digits | `6` |
| `WALLET_MAX_TOPUP` | Max top-up per transaction (INR) | `5000` |
| `WALLET_MIN_TOPUP` | Min top-up per transaction (INR) | `10` |
| `UPLOAD_DIR` | Directory for uploaded images | `uploads` |
| `MAX_FILE_SIZE_MB` | Max upload size in MB | `2` |
| `CORS_ORIGINS` | Comma-separated allowed origins | — |
| `OTP_RATE_LIMIT_WINDOW_MINUTES` | OTP rate-limit window | `15` |
| `OTP_RATE_LIMIT_MAX` | Max OTP requests per window | `5` |

---

## Error Handling

All errors return consistent JSON:

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": [                        // Only present for validation errors
    { "field": "phone", "message": "Enter a valid 10-digit Indian mobile number" }
  ]
}
```

| HTTP Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad request / OTP invalid |
| `401` | Unauthenticated |
| `402` | Insufficient wallet balance |
| `403` | Forbidden (wrong role) |
| `404` | Not found |
| `409` | Conflict (duplicate) |
| `413` | File too large |
| `422` | Validation error |
| `429` | Too many requests (rate-limit) |
| `500` | Internal server error |

---

## Security Measures

| Measure | Implementation |
|---|---|
| Security headers | `helmet` middleware |
| CORS control | Whitelisted origins only |
| OTP brute force | Max 5 attempts before OTP invalidated |
| OTP flooding | Rate-limited: 5 OTPs per 15 min per phone |
| OTP storage | Stored as bcrypt hash — never plaintext |
| JWT refresh rotation | Old token revoked on every refresh |
| SQL injection | Sequelize parameterized queries |
| File upload | Image types only (jpg/png/webp), max 2 MB |
| Wallet race conditions | Row-level DB lock during balance updates |
| Password hashing | bcrypt with 12 rounds (admin passwords) |

---

## Logging

Winston logger with three outputs:

| Output | Level | Location |
|---|---|---|
| Console | `debug` (dev) / `info` (prod) | Colored terminal |
| Error file | `error` only | `logs/error.log` |
| Combined file | All levels | `logs/combined.log` |

Morgan HTTP request logs are piped into Winston (`info` level).

Log format: `[YYYY-MM-DD HH:mm:ss] LEVEL: message`

---

## Response Format

**Success:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": { ... }
}
```

**Paginated list:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "orders": [ ... ],
    "meta": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

---

## License

ISC © NutriCanteen Team
