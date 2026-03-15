# 💰 Wallet Backend API

A powerful **Node.js** backend for a smart digital wallet application with AI-powered transaction parsing and financial advice.

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API Framework |
| **PostgreSQL** | Primary Database |
| **Redis** | Distributed Locking (prevent double transactions) |
| **JWT** | Authentication & Authorization |
| **bcrypt** | Password Hashing |
| **Google Gemini AI** | Smart transaction parsing & financial advice |

---

## 📁 Project Structure

```
wallet-back-node.js/
├── start.js              # Entry point
├── router.js             # All routes
├── auth.js               # Auth & User handlers
├── depositAndWithdraw.js # Wallet operations & transactions
├── categories&Budgets.js # Budget management & AI advice
├── db.js                 # PostgreSQL connection
├── redisClient.js        # Redis connection
└── middelware/
    ├── sureTocken.js     # JWT middleware
    └── JwtMake.js        # JWT generator
```

---

## 🔐 Authentication

All protected routes require a **Bearer Token** in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📌 Endpoints

### 🔑 Auth (Public)

<details>
<summary><b>POST /auth/signup</b> — Register a new user</summary>

**Request Body:**
```json
{
  "name": "Youssef Ahmed",
  "email": "youssef@example.com",
  "password": "mypassword123"
}
```

**Validation:**
- `name`: 2–50 characters
- `email`: Valid email format
- `password`: Minimum 8 characters

**Success Response `201`:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "name": "Youssef Ahmed",
    "email": "youssef@example.com",
    "created_at": "2026-03-15T10:00:00Z"
  },
  "wallet": {
    "id": "uuid",
    "user_id": "uuid",
    "balance": "0.00"
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| `400` | Name/email/password validation failed |
| `409` | User already exists |

</details>

---

<details>
<summary><b>POST /auth/login</b> — Login and get JWT token</summary>

**Request Body:**
```json
{
  "email": "youssef@example.com",
  "password": "mypassword123"
}
```

**Success Response `200`:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "youssef@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
| Code | Message |
|------|---------|
| `400` | Invalid email or password |

</details>

---

### 👤 User (Protected)

<details>
<summary><b>GET /user/profile</b> — Get current user profile</summary>

**Headers:** `Authorization: Bearer <token>`

**Success Response `200`:**
```json
{
  "user": {
    "id": "uuid",
    "name": "Youssef Ahmed",
    "email": "youssef@example.com",
    "balance": "1500.00",
    "wallet_id": "uuid",
    "currency": "EGP"
  }
}
```

</details>

---

<details>
<summary><b>PUT /user/profile</b> — Update user name</summary>

**Request Body:**
```json
{
  "name": "New Name"
}
```

**Success Response `200`:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "name": "New Name",
    "email": "youssef@example.com"
  }
}
```

</details>

---

<details>
<summary><b>PUT /user/password</b> — Change password</summary>

**Request Body:**
```json
{
  "oldPassword": "mypassword123",
  "newPassword": "newpassword456"
}
```

**Success Response `200`:**
```json
{
  "message": "Password changed successfully"
}
```

**Errors:**
| Code | Message |
|------|---------|
| `400` | Invalid old password |
| `400` | New password must be at least 8 characters |

</details>

---

<details>
<summary><b>POST /user/local-wallet</b> — Create a local (offline) wallet</summary>

> Each user can have only **one** local wallet.

**Success Response `201`:**
```json
{
  "message": "Local wallet created successfully",
  "wallet": {
    "id": "uuid",
    "user_id": "uuid",
    "balance": "0.00"
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| `400` | Local wallet already exists for this user |

</details>

---

<details>
<summary><b>GET /user/local-wallet</b> — Get local wallet info</summary>

**Success Response `200`:**
```json
{
  "localWallets": [
    {
      "id": "uuid",
      "balance": "500.00",
      "updated_at": "2026-03-15T10:00:00Z"
    }
  ]
}
```

</details>

---

### 💼 Wallets (Protected)

<details>
<summary><b>GET /wallets</b> — Get all wallets for the user</summary>

**Success Response `200`:**
```json
{
  "wallets": [
    {
      "id": "uuid",
      "balance": "2500.00",
      "currency": "EGP",
      "updated_at": "2026-03-15T10:00:00Z"
    }
  ]
}
```

</details>

---

<details>
<summary><b>POST /wallets/deposit</b> — Deposit money into main wallet</summary>

> Uses **Redis distributed lock** + **idempotency key** to prevent duplicate transactions.

**Request Body:**
```json
{
  "amount": 500.00,
  "idempotencyKey": "unique-key-123"
}
```

**Validation:**
- `amount`: 0.01 – 20,000
- `idempotencyKey`: Required (use UUID or unique string per request)

**Success Response `201`:**
```json
{
  "transaction": {
    "id": "uuid",
    "amount": "500.00",
    "type": "deposit",
    "new_balance": "3000.00",
    "created_at": "2026-03-15T10:00:00Z"
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| `400` | Invalid amount |
| `400` | Idempotency key is required |
| `409` | Request already in progress |

</details>

---

<details>
<summary><b>POST /wallets/withdraw</b> — Withdraw money from main wallet</summary>

**Request Body:**
```json
{
  "amount": 200.00,
  "idempotencyKey": "unique-key-456",
  "category_id": "uuid"
}
```

**Validation:**
- `amount`: 0.01 – 100,000
- `category_id`: Optional — link withdrawal to a spending category

**Success Response `201`:**
```json
{
  "transaction": {
    "id": "uuid",
    "amount": "-200.00",
    "type": "withdraw",
    "new_balance": "2800.00",
    "created_at": "2026-03-15T10:00:00Z"
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| `409` | Insufficient balance |

</details>

---

### 🏦 Local Wallet (Protected)

<details>
<summary><b>POST /local-wallets/deposit</b> — Deposit money into local wallet</summary>

**Request Body:**
```json
{
  "amount": 1000.00,
  "idempotencyKey": "unique-key-789"
}
```

**Success Response `201`:**
```json
{
  "transaction": {
    "id": "uuid",
    "amount": "1000.00",
    "type": "deposit",
    "new_balance": "1000.00",
    "created_at": "2026-03-15T10:00:00Z"
  }
}
```

</details>

---

### 🔄 Transfers (Protected)

<details>
<summary><b>POST /transfers</b> — Transfer money to another user</summary>

> Uses **SERIALIZABLE transaction isolation** + **dual Redis locks** to prevent race conditions.

**Request Body:**
```json
{
  "toEmail": "friend@example.com",
  "amount": 300.00,
  "idempotencyKey": "transfer-key-001",
  "description": "Rent split"
}
```

**Validation:**
- `amount`: 0.01 – 100,000
- `toEmail`: Must be a registered user (cannot transfer to yourself)

**Success Response `201`:**
```json
{
  "transfer": {
    "id": "uuid",
    "from": {
      "name": "Youssef Ahmed",
      "email": "youssef@example.com",
      "new_balance": "2500.00"
    },
    "to": {
      "name": "Mohamed Ali",
      "email": "friend@example.com"
    },
    "amount": 300.00,
    "created_at": "2026-03-15T10:00:00Z"
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| `400` | Cannot transfer to yourself |
| `404` | Receiver not found |
| `409` | Insufficient balance |
| `409` | Transaction conflict. Please retry |

</details>

---

### 📋 Transactions (Protected)

<details>
<summary><b>GET /transactions</b> — Get main wallet transaction history</summary>

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 (max 100) | Items per page |
| `type` | string | — | Filter: `deposit`, `withdraw`, `transfer` |

**Example:** `GET /transactions?page=1&limit=10&type=deposit`

**Success Response `200`:**
```json
{
  "transactions": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

</details>

---

<details>
<summary><b>GET /transactions/:id</b> — Get transaction details by ID</summary>

**Params:** `id` — Transaction UUID

**Success Response `200`:**
```json
{
  "transaction": {
    "id": "uuid",
    "wallet_id": "uuid",
    "category_id": "uuid",
    "amount": "-200.00",
    "type": "withdraw",
    "description": "Groceries",
    "status": "completed",
    "is_synced": true,
    "ai_metadata": null,
    "created_at": "2026-03-15T10:00:00Z"
  }
}
```

**Errors:**
| Code | Message |
|------|---------|
| `400` | Invalid transaction ID format |
| `404` | Transaction not found |

</details>

---

<details>
<summary><b>GET /local-transactions</b> — Get local wallet transaction history</summary>

Same query params as `/transactions` (`page`, `limit`, `type`).

**Additional types for local wallet:**
`manual_expense`, `manual_income`, `ai_expense`, `ai_income`

</details>

---

<details>
<summary><b>GET /local-transactions/:id</b> — Get local wallet transaction by ID</summary>

Same structure as `/transactions/:id` but scoped to local wallet.

</details>

---

### 🤖 AI Transactions (Protected — Local Wallet)

<details>
<summary><b>POST /transactions/manual</b> — Add a manual income/expense to local wallet</summary>

**Request Body:**
```json
{
  "type": "manual_expense",
  "amount": 150.00,
  "category_id": "uuid",
  "description": "Lunch at work",
  "idempotencyKey": "manual-tx-001"
}
```

**Type values:** `manual_expense` | `manual_income`

**Success Response `201`:**
```json
{
  "transaction": {
    "id": "uuid",
    "amount": "-150.00",
    "type": "manual_expense",
    "category": "Food",
    "new_balance": "850.00",
    "created_at": "2026-03-15T10:00:00Z"
  }
}
```

</details>

---

<details>
<summary><b>POST /transactions/ai</b> — 🧠 Add transactions using natural language (AI)</summary>

> Powered by **Google Gemini AI**. Send Arabic or English text describing your spending — the AI extracts all transactions automatically.

**Request Body:**
```json
{
  "text": "اشتريت فراخ بـ 300 جنيه وبطاطس بـ 50 جنيه",
  "idempotencyKey": "ai-tx-001"
}
```

**Success Response `201`:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "amount": "-300.00",
      "type": "ai_expense",
      "category": "Food",
      "description": "فراخ",
      "confidence": 0.97,
      "created_at": "2026-03-15T10:00:00Z"
    },
    {
      "id": "uuid",
      "amount": "-50.00",
      "type": "ai_expense",
      "category": "Food",
      "description": "بطاطس",
      "confidence": 0.95,
      "created_at": "2026-03-15T10:00:00Z"
    }
  ],
  "new_balance": "650.00",
  "count": 2
}
```

**Supported Categories (AI):**
`Food` | `Transport` | `Bills & Utilities` | `Entertainment` | `Health` | `Shopping` | `Education` | `Salary` | `Freelance` | `Gift` | `Other`

**Errors:**
| Code | Message |
|------|---------|
| `400` | Text is required |
| `400` | AI confidence too low. Please be more specific |
| `409` | Insufficient balance |
| `500` | AI parsing failed |

</details>

---

### 🏷️ Categories (Protected)

<details>
<summary><b>GET /categories</b> — Get all spending categories</summary>

**Success Response `200`:**
```json
{
  "categories": [
    { "id": "uuid", "name": "Food", "type": "expense" },
    { "id": "uuid", "name": "Salary", "type": "income" }
  ]
}
```

</details>

---

<details>
<summary><b>POST /categories</b> — Add a new category</summary>

**Request Body:**
```json
{
  "name": "Gym",
  "type": "expense"
}
```

**type values:** `income` | `expense`

**Success Response `201`:**
```json
{
  "message": "Category added successfully",
  "category": {
    "id": "uuid",
    "name": "Gym",
    "type": "expense"
  }
}
```

</details>

---

### 📊 Budgets (Protected)

<details>
<summary><b>GET /budgets?month_year=YYYY-MM</b> — Get monthly budgets</summary>

**Query Parameters:**
| Param | Required | Format | Example |
|-------|----------|--------|---------|
| `month_year` | Yes | `YYYY-MM` | `2026-03` |

**Success Response `200`:**
```json
{
  "budgets": [
    {
      "id": "uuid",
      "monthly_limit": "2000.00",
      "month_year": "2026-03",
      "category_name": "Food",
      "category_type": "expense"
    }
  ]
}
```

</details>

---

<details>
<summary><b>POST /budgets</b> — Create a monthly budget</summary>

**Request Body:**
```json
{
  "category_id": "uuid",
  "month_year": "2026-03",
  "monthly_limit": 2000.00
}
```

**Success Response `201`:**
```json
{
  "message": "Budget created successfully",
  "budget": {
    "id": "uuid",
    "user_id": "uuid",
    "category_id": "uuid",
    "month_year": "2026-03",
    "monthly_limit": "2000.00"
  }
}
```

</details>

---

<details>
<summary><b>PUT /budgets/:id</b> — Update a monthly budget limit</summary>

**Request Body:**
```json
{
  "monthly_limit": 2500.00
}
```

**Success Response `200`:**
```json
{
  "message": "Budget updated successfully",
  "budget": { ... }
}
```

</details>

---

<details>
<summary><b>GET /budgets/rest/:month_year</b> — Budget remaining for main wallet</summary>

Returns how much is **spent vs remaining** for each budget category in the given month (main wallet).

**Params:** `month_year` — e.g. `2026-03`

**Success Response `200`:**
```json
{
  "success": true,
  "budgets": [
    {
      "id": "uuid",
      "monthly_limit": "2000.00",
      "month_year": "2026-03",
      "category_name": "Food",
      "category_type": "expense",
      "spent_amount": "-800.00"
    }
  ]
}
```

</details>

---

<details>
<summary><b>GET /budgetsLocal/rest/:month_year</b> — Budget remaining for local wallet</summary>

Same as above but for **local wallet**. Also returns a `remaining` field.

**Success Response `200`:**
```json
{
  "success": true,
  "budgets": [
    {
      "budget_id": "uuid",
      "monthly_limit": "2000.00",
      "month_year": "2026-03",
      "category_name": "Food",
      "category_type": "expense",
      "spent_amount": "-600.00",
      "remaining": "1400.00"
    }
  ]
}
```

</details>

---

<details>
<summary><b>GET /budgets/transactions/:id</b> — Transactions for a budget (main wallet)</summary>

Returns all transactions linked to a specific budget ID for the main wallet.

**Success Response `200`:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "amount": "-300.00",
      "created_at": "2026-03-10T10:00:00Z",
      "description": "Lunch",
      "category_name": "Food",
      "category_type": "expense"
    }
  ]
}
```

</details>

---

<details>
<summary><b>GET /budgetsLocal/transactions/:id</b> — Transactions for a budget (local wallet)</summary>

Same as above but for **local wallet**.

</details>

---

### 💡 AI Financial Advice (Protected)

<details>
<summary><b>POST /budgets/advice</b> — 🧠 Get AI financial advice for main wallet</summary>

> Analyzes your monthly spending, compares it to your budgets, and generates **personalized Arabic financial advice** using Google Gemini AI.

**Request Body:**
```json
{
  "month_year": "2026-03",
  "city": "Cairo"
}
```

**Success Response `200`:**
```json
{
  "success": true,
  "month_year": "2026-03",
  "summary": [
    {
      "category": "Food",
      "type": "expense",
      "limit": 2000,
      "spent": 1700,
      "remaining": 300,
      "percentage": 85
    }
  ],
  "advice": "يا صديقي، لاحظت إنك صرفت 85% من بادجت الأكل بتاعك..."
}
```

**Errors:**
| Code | Message |
|------|---------|
| `400` | month_year مطلوب بصيغة YYYY-MM |
| `400` | city مطلوب |
| `404` | مفيش بادجت للشهر ده |

</details>

---

<details>
<summary><b>POST /budgets/local-advice</b> — 🧠 Get AI financial advice for local wallet</summary>

Same as `/budgets/advice` but analyzes **local wallet** transactions. Includes AI metadata from previous AI transactions for richer advice.

**Request Body:**
```json
{
  "month_year": "2026-03",
  "city": "Alexandria"
}
```

</details>

---

## 🛡️ Security Features

| Feature | Implementation |
|---------|---------------|
| **Password Hashing** | bcrypt with 12 salt rounds |
| **JWT Auth** | Signed tokens — required for all protected routes |
| **Idempotency Keys** | Prevent duplicate transactions on retry |
| **Redis Distributed Locks** | Prevent race conditions on concurrent wallet operations |
| **Serializable Transactions** | Full ACID isolation for transfers |
| **Input Validation** | Server-side validation on all inputs |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wallet_db

# JWT
JWT_SECRET=your_jwt_secret_key

# Redis
REDIS_URL=redis://localhost:6379

# Google AI
GOOGLE_API_KEY=your_google_gemini_api_key
```

---

## 🏃 Getting Started

```bash
# Install dependencies
npm install

# Start the server
node start.js
```

---

## 📐 Data Flow

```
Client Request
     │
     ▼
JWT Middleware (sureTocken)
     │
     ▼
Wallet/LocalWallet Middleware (walletFound / LocalWalletFound)
     │
     ▼
Route Handler
     │
     ├── Redis Lock (concurrent protection)
     │
     ├── PostgreSQL Transaction (BEGIN / COMMIT / ROLLBACK)
     │
     └── Response
```

---

## 💡 Idempotency Guide

Every write operation (deposit, withdraw, transfer, manual transaction, AI transaction) requires an `idempotencyKey`. This prevents duplicate charges if a request is retried.

```js
// Generate a unique key per operation
const idempotencyKey = crypto.randomUUID();
```

Sending the **same key twice** returns the original transaction result safely without creating a duplicate.
