# 🏦 WealthWise AI — API Endpoints Reference

> **Base URL:** `http://localhost:3333/api`  
> **Auth:** Bearer Token (JWT) في Header: `Authorization: Bearer <token>`  
> **Content-Type:** `application/json`

---

## 📑 الفهرس

| القسم | عدد الـ Endpoints |
|-------|:-----------------:|
| [1. Authentication](#1-authentication-🔐) | 3 |
| [2. User Management](#2-user-management-👤) | 3 |
| [3. Wallets](#3-wallets-💰) | 3 |
| [4. Transfers (P2P)](#4-transfers-p2p-🔄) | 1 |
| [5. Transactions](#5-transactions-📋) | 3 |
| [6. Categories](#6-categories-🏷️) | 2 |
| [7. Budgets](#7-budgets-📊) | 3 |
| [8. Sync (Offline)](#8-sync-offline-🔁) | 1 |
| [9. AI Engine](#9-ai-engine-🤖) | 3 |
| [10. Analytics & Dashboard](#10-analytics--dashboard-📈) | 2 |
| **المجموع** | **24** |

---

## 1. Authentication 🔐

### `POST /api/auth/signup`

> تسجيل مستخدم جديد + إنشاء محفظة تلقائياً

| البند | التفاصيل |
|-------|---------|
| **Auth** | ❌ لا يحتاج توكن |
| **Rate Limit** | 5 طلبات / دقيقة لكل IP |
| **ملاحظات أمان** | الباسورد يتم تشفيره بـ bcrypt (12 rounds). الإيميل يُحفظ lowercase. لا يتم إرجاع password hash أبداً |

**📥 Request Body:**
```json
{
  "name": "يوسف أحمد",
  "email": "youssef@example.com",
  "password": "MyStr0ng!Pass"
}
```

| الحقل | النوع | مطلوب | القيود |
|-------|-------|:-----:|--------|
| `name` | string | ✅ | 2-50 حرف |
| `email` | string | ✅ | email format صالح |
| `password` | string | ✅ | 8 أحرف على الأقل |

**📤 Response — `201 Created`:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "a1b2c3d4-...",
    "name": "يوسف أحمد",
    "email": "youssef@example.com",
    "created_at": "2026-03-03T10:00:00Z"
  },
  "wallet": {
    "id": "w1x2y3z4-...",
    "balance": "0.00"
  }
}
```

**❌ Error Responses:**

| Status | الحالة | Response |
|:------:|--------|----------|
| `400` | بيانات ناقصة أو غير صالحة | `{"message": "Password must be at least 8 characters"}` |
| `409` | الإيميل مستخدم | `{"message": "User already exists"}` |
| `500` | خطأ داخلي | `{"message": "Internal server error"}` |

---

### `POST /api/auth/login`

> تسجيل الدخول والحصول على JWT Token

| البند | التفاصيل |
|-------|---------|
| **Auth** | ❌ لا يحتاج توكن |
| **Rate Limit** | 10 طلبات / دقيقة لكل IP (لمنع brute-force) |
| **ملاحظات أمان** | الرسالة واحدة سواء الإيميل غلط أو الباسورد غلط (يمنع user enumeration). التوكن صلاحيته 7 أيام |

**📥 Request Body:**
```json
{
  "email": "youssef@example.com",
  "password": "MyStr0ng!Pass"
}
```

**📤 Response — `200 OK`:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "a1b2c3d4-...",
    "email": "youssef@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**❌ Error Responses:**

| Status | الحالة | Response |
|:------:|--------|----------|
| `400` | إيميل أو باسورد غلط | `{"message": "Invalid email or password"}` |
| `500` | خطأ داخلي | `{"message": "Internal server error"}` |

---

### `POST /api/auth/refresh-token`

> تجديد التوكن قبل انتهاء صلاحيته (يمنع تسجيل خروج غير متوقع)

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |
| **ملاحظات** | يُستخدم لما التوكن قرب ينتهي. يرجع توكن جديد بصلاحية 7 أيام جديدة |

**📥 Request:** لا يحتاج body — التوكن القديم في الـ Header

**📤 Response — `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...(new)"
}
```

**❌ Error Responses:**

| Status | الحالة | Response |
|:------:|--------|----------|
| `401` | توكن مفقود | `{"message": "No token provided"}` |
| `403` | توكن منتهي | `{"message": "Invalid token"}` |

---

## 2. User Management 👤

### `GET /api/user/profile`

> جلب بيانات المستخدم + المحفظة

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |
| **ملاحظات** | لا يرجع الباسورد أبداً. البيانات تُجلب بـ JOIN بين users و wallets |

**📤 Response — `200 OK`:**
```json
{
  "user": {
    "id": "a1b2c3d4-...",
    "name": "يوسف أحمد",
    "email": "youssef@example.com",
    "balance": "5000.00",
    "wallet_id": "w1x2y3z4-...",
    "currency": "EGP"
  }
}
```

---

### `PUT /api/user/profile`

> تحديث اسم المستخدم

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |

**📥 Request Body:**
```json
{
  "name": "يوسف محمد"
}
```

| الحقل | النوع | مطلوب | القيود |
|-------|-------|:-----:|--------|
| `name` | string | ✅ | 2-50 حرف |

**📤 Response — `200 OK`:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "a1b2c3d4-...",
    "name": "يوسف محمد",
    "email": "youssef@example.com"
  }
}
```

---

### `PUT /api/user/password`

> تغيير كلمة المرور

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |
| **ملاحظات أمان** | يجب إدخال الباسورد القديم. الباسورد الجديد يُشفر بـ bcrypt (12 rounds) |

**📥 Request Body:**
```json
{
  "oldPassword": "MyStr0ng!Pass",
  "newPassword": "NewStr0ng!Pass2"
}
```

| الحقل | النوع | مطلوب | القيود |
|-------|-------|:-----:|--------|
| `oldPassword` | string | ✅ | — |
| `newPassword` | string | ✅ | 8 أحرف على الأقل |

**📤 Response — `200 OK`:**
```json
{
  "message": "Password changed successfully"
}
```

**❌ Error Responses:**

| Status | الحالة | Response |
|:------:|--------|----------|
| `400` | الباسورد القديم غلط | `{"message": "Invalid old password"}` |
| `400` | الباسورد الجديد ضعيف | `{"message": "New password must be at least 8 characters"}` |

---

## 3. Wallets 💰

### `GET /api/wallets`

> جلب بيانات محافظ المستخدم

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |

**📤 Response — `200 OK`:**
```json
{
  "wallets": [
    {
      "id": "w1x2y3z4-...",
      "balance": "5000.00",
      "currency": "EGP",
      "updated_at": "2026-03-03T10:00:00Z"
    }
  ]
}
```

---

### `POST /api/wallets/deposit`

> إيداع مبلغ في المحفظة

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |
| **Middleware** | `sureTockentoken` → `walletFound` (يجيب walletId ويحطه في `req.user.walletId`) |
| **Idempotency** | ✅ مطلوب `idempotencyKey` — UUID فريد من الموبايل لمنع الإيداع المزدوج |
| **Redis Lock** | ✅ يقفل المحفظة لمدة 10 ثواني لمنع race condition |
| **DB Transaction** | ✅ `BEGIN` → `INSERT` → `UPDATE wallet` → `COMMIT` (أو `ROLLBACK` لو حصل خطأ) |

**📥 Request Body:**
```json
{
  "amount": 1000,
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000"
}
```

| الحقل | النوع | مطلوب | القيود |
|-------|-------|:-----:|--------|
| `amount` | number | ✅ | بين 0.01 و 20,000 |
| `idempotencyKey` | string (UUID) | ✅ | فريد لكل عملية |

**📤 Response — `201 Created` (عملية جديدة):**
```json
{
  "transaction": {
    "id": "tx-uuid-...",
    "amount": "1000.00",
    "type": "deposit",
    "new_balance": "6000.00",
    "created_at": "2026-03-03T10:05:00Z"
  }
}
```

**📤 Response — `200 OK` (عملية مكررة - نفس الـ idempotencyKey):**
```json
{
  "message": "Transaction already processed",
  "transaction": {
    "id": "tx-uuid-...",
    "amount": "1000.00",
    "type": "deposit",
    "new_balance": "6000.00",
    "created_at": "2026-03-03T10:05:00Z"
  }
}
```

**❌ Error Responses:**

| Status | الحالة | Response |
|:------:|--------|----------|
| `400` | مبلغ غير صالح | `{"message": "Invalid amount. Must be between 0.01 and 20,000"}` |
| `400` | idempotencyKey مفقود | `{"message": "Idempotency key is required"}` |
| `409` | طلب قيد المعالجة (lock) | `{"message": "Request already in progress. Please wait."}` |

---

### `POST /api/wallets/withdraw`

> سحب مبلغ من المحفظة

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |
| **Middleware** | `sureTockentoken` → `walletFound` |
| **Idempotency** | ✅ مطلوب |
| **Redis Lock** | ✅ |
| **الحد الأدنى للرصيد** | `-1000` (سماحية سحب على المكشوف) |

**📥 Request Body:**
```json
{
  "amount": 500,
  "idempotencyKey": "660e8400-e29b-41d4-a716-446655440001"
}
```

| الحقل | النوع | مطلوب | القيود |
|-------|-------|:-----:|--------|
| `amount` | number | ✅ | بين 0.01 و 100,000 |
| `idempotencyKey` | string (UUID) | ✅ | فريد لكل عملية |

**📤 Response — `201 Created`:**
```json
{
  "transaction": {
    "id": "tx-uuid-...",
    "amount": "500.00",
    "type": "withdraw",
    "new_balance": "5500.00",
    "created_at": "2026-03-03T10:10:00Z"
  }
}
```

**❌ Error Responses:**

| Status | الحالة | Response |
|:------:|--------|----------|
| `409` | رصيد غير كافي | `{"message": "Insufficient balance"}` |

> باقي الأخطاء مثل الـ deposit

---

## 4. Transfers (P2P) 🔄

### `POST /api/transfers`

> تحويل فوري بين مستخدمين (Peer-to-Peer)

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |
| **Middleware** | `sureTockentoken` → `walletFound` |
| **Idempotency** | ✅ مطلوب |
| **Redis Lock** | ✅ يقفل **محفظتين** بترتيب ثابت (يمنع deadlock) |
| **Isolation Level** | `SERIALIZABLE` (أعلى مستوى أمان لمنع race conditions) |
| **ملاحظات** | لا يمكن التحويل لنفسك. يُسجل recordين: واحد debit وواحد credit |

**📥 Request Body:**
```json
{
  "toEmail": "ahmed@example.com",
  "amount": 200,
  "description": "تحويل إيجار الشقة",
  "idempotencyKey": "770e8400-e29b-41d4-a716-446655440002"
}
```

| الحقل | النوع | مطلوب | القيود |
|-------|-------|:-----:|--------|
| `toEmail` | string | ✅ | إيميل مستخدم مسجل |
| `amount` | number | ✅ | بين 0.01 و 100,000 |
| `description` | string | ❌ | نص حر |
| `idempotencyKey` | string (UUID) | ✅ | فريد لكل عملية |

**📤 Response — `201 Created`:**
```json
{
  "transfer": {
    "id": "tx-uuid-...",
    "from": {
      "name": "يوسف أحمد",
      "new_balance": "4800.00"
    },
    "to": {
      "name": "أحمد محمد"
    },
    "amount": 200,
    "created_at": "2026-03-03T10:15:00Z"
  }
}
```

**❌ Error Responses:**

| Status | الحالة | Response |
|:------:|--------|----------|
| `400` | تحويل لنفسك | `{"message": "Cannot transfer to yourself"}` |
| `404` | المستقبل غير موجود | `{"message": "Receiver not found"}` |
| `409` | رصيد غير كافي | `{"message": "Insufficient balance"}` |
| `409` | تعارض (serialization) | `{"message": "Transaction conflict. Please retry."}` |

---

## 5. Transactions 📋

### `GET /api/transactions`

> تاريخ العمليات مع pagination وفلترة

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |
| **Middleware** | `sureTockentoken` → `walletFound` |
| **ملاحظات** | النتائج مرتبة من الأحدث للأقدم. الحد الأقصى 100 عملية في الصفحة |

**📥 Query Parameters:**

| الحقل | النوع | مطلوب | افتراضي | القيود |
|-------|-------|:-----:|:-------:|--------|
| `page` | number | ❌ | 1 | 1+ |
| `limit` | number | ❌ | 20 | 1-100 |
| `type` | string | ❌ | — | `deposit`, `withdraw`, `transfer`, `manual_expense`, `manual_income` |

**مثال:** `GET /api/transactions?page=1&limit=10&type=deposit`

**📤 Response — `200 OK`:**
```json
{
  "transactions": [
    {
      "id": "tx-uuid-1",
      "wallet_id": "w1x2y3z4-...",
      "category_id": null,
      "amount": "1000.00",
      "type": "deposit",
      "description": null,
      "is_synced": true,
      "created_at": "2026-03-03T10:05:00Z"
    },
    {
      "id": "tx-uuid-2",
      "wallet_id": "w1x2y3z4-...",
      "category_id": 5,
      "amount": "-500.00",
      "type": "manual_expense",
      "description": "فاتورة كهرباء",
      "is_synced": true,
      "created_at": "2026-03-02T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 47,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### `GET /api/transactions/:id`

> تفاصيل عملية واحدة بالـ ID

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |
| **Middleware** | `sureTockentoken` → `walletFound` |
| **ملاحظات أمان** | يتحقق أن العملية تابعة لمحفظة المستخدم (يمنع IDOR) |

**📥 URL Param:** `id` = UUID العملية

**مثال:** `GET /api/transactions/550e8400-e29b-41d4-a716-446655440000`

**📤 Response — `200 OK`:**
```json
{
  "transaction": {
    "id": "550e8400-...",
    "wallet_id": "w1x2y3z4-...",
    "category_id": 5,
    "amount": "-500.00",
    "type": "manual_expense",
    "description": "فاتورة كهرباء",
    "is_synced": true,
    "created_at": "2026-03-02T14:30:00Z"
  }
}
```

**❌ Error Responses:**

| Status | الحالة | Response |
|:------:|--------|----------|
| `400` | ID غير صالح | `{"message": "Invalid transaction ID format"}` |
| `404` | غير موجودة | `{"message": "Transaction not found"}` |

---

### `POST /api/transactions/manual`

> إدخال عملية يدوية (مصروف أو دخل) — الأساس لدعم Offline

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |
| **Middleware** | `sureTockentoken` → `walletFound` |
| **Idempotency** | ✅ مطلوب (أساسي لـ Offline Sync لمنع التكرار) |
| **Redis Lock** | ✅ |
| **Budget Update** | ✅ لو expense، يُحدّث `current_spent` في جدول budgets تلقائياً |
| **ملاحظات** | هذا الـ endpoint هو اللي بيستخدمه الموبايل لما يعمل sync بعد ما يرجع أونلاين |

**📥 Request Body:**
```json
{
  "amount": 150,
  "type": "manual_expense",
  "category_id": 1,
  "description": "خضار من السوق",
  "idempotencyKey": "880e8400-e29b-41d4-a716-446655440003"
}
```

| الحقل | النوع | مطلوب | القيود |
|-------|-------|:-----:|--------|
| `amount` | number | ✅ | بين 0.01 و 100,000 |
| `type` | string | ✅ | `manual_expense` أو `manual_income` |
| `category_id` | number | ✅ | ID تصنيف موجود في جدول categories |
| `description` | string | ❌ | نص حر |
| `idempotencyKey` | string (UUID) | ✅ | فريد لكل عملية |

**📤 Response — `201 Created`:**
```json
{
  "transaction": {
    "id": "tx-uuid-...",
    "amount": "-150.00",
    "type": "manual_expense",
    "category": "Food & Drinks",
    "new_balance": "4850.00",
    "created_at": "2026-03-03T11:00:00Z"
  }
}
```

**❌ Error Responses:**

| Status | الحالة | Response |
|:------:|--------|----------|
| `400` | نوع غير صالح | `{"message": "Type must be 'manual_expense' or 'manual_income'"}` |
| `400` | تصنيف غير موجود | `{"message": "Invalid category_id"}` |
| `409` | رصيد غير كافي (للمصروف) | `{"message": "Insufficient balance"}` |

---

## 6. Categories 🏷️

### `GET /api/categories`

> جلب كل التصنيفات (الافتراضية + المخصصة)

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |

**📤 Response — `200 OK`:**
```json
{
  "categories": [
    { "id": 1,  "name": "Food & Drinks",  "icon": "🍔", "type": "expense" },
    { "id": 2,  "name": "Transportation",  "icon": "🚗", "type": "expense" },
    { "id": 3,  "name": "Shopping",        "icon": "🛒", "type": "expense" },
    { "id": 4,  "name": "Entertainment",   "icon": "🎬", "type": "expense" },
    { "id": 5,  "name": "Utilities",       "icon": "💡", "type": "expense" },
    { "id": 6,  "name": "Healthcare",      "icon": "🏥", "type": "expense" },
    { "id": 7,  "name": "Education",       "icon": "📚", "type": "expense" },
    { "id": 8,  "name": "Housing",         "icon": "🏠", "type": "expense" },
    { "id": 9,  "name": "Salary",          "icon": "💰", "type": "income"  },
    { "id": 10, "name": "Freelance",       "icon": "💻", "type": "income"  },
    { "id": 11, "name": "Investment",      "icon": "📈", "type": "both"    },
    { "id": 12, "name": "Other",           "icon": "📦", "type": "both"    }
  ]
}
```

---

### `POST /api/categories`

> إنشاء تصنيف مخصص جديد

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |

**📥 Request Body:**
```json
{
  " ": "اشتراكات",
  "icon": "📱",
  "type": "expense"
}
```

| الحقل | النوع | مطلوب | القيود |
|-------|-------|:-----:|--------|
| `name` | string | ✅ | 2-100 حرف |
| `icon` | string | ❌ | emoji واحد |
| `type` | string | ✅ | `income`, `expense`, أو `both` |

**📤 Response — `201 Created`:**
```json
{
  "category": {
    "id": 13,
    "name": "اشتراكات",
    "icon": "📱",
    "type": "expense"
  }
}
```

---

## 7. Budgets 📊

### `GET /api/budgets`

> جلب ميزانيات شهر معين

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |

**📥 Query Parameters:**

| الحقل | النوع | مطلوب | افتراضي |
|-------|-------|:-----:|:-------:|
| `month_year` | string | ❌ | الشهر الحالي `2026-03` |

**مثال:** `GET /api/budgets?month_year=2026-03`

**📤 Response — `200 OK`:**
```json
{
  "budgets": [
    {
      "id": 1,
      "category_id": 1,
      "category_name": "Food & Drinks",
      "category_icon": "🍔",
      "limit_amount": "3000.00",
      "current_spent": "1250.00",
      "remaining": "1750.00",
      "percentage_used": 41.67,
      "month_year": "2026-03"
    },
    {
      "id": 2,
      "category_id": 5,
      "category_name": "Utilities",
      "category_icon": "💡",
      "limit_amount": "1000.00",
      "current_spent": "950.00",
      "remaining": "50.00",
      "percentage_used": 95.0,
      "month_year": "2026-03"
    }
  ]
}
```

---

### `POST /api/budgets`

> إنشاء ميزانية شهرية لتصنيف معين

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |
| **ملاحظات** | لا يمكن إنشاء ميزانيتين لنفس التصنيف في نفس الشهر (UNIQUE constraint) |

**📥 Request Body:**
```json
{
  "category_id": 1,
  "monthly_limit": 3000,
  "month_year": "2026-03"
}
```

| الحقل | النوع | مطلوب | القيود |
|-------|-------|:-----:|--------|
| `category_id` | number | ✅ | ID تصنيف موجود |
| `monthly_limit` | number | ✅ | أكبر من 0 |
| `month_year` | string | ✅ | Format: `YYYY-MM` |

**📤 Response — `201 Created`:**
```json
{
  "budget": {
    "id": 1,
    "category_id": 1,
    "monthly_limit": "3000.00",
    "current_spent": "0.00",
    "month_year": "2026-03"
  }
}
```

**❌ Error Responses:**

| Status | الحالة | Response |
|:------:|--------|----------|
| `409` | ميزانية موجودة لنفس التصنيف والشهر | `{"message": "Budget already exists for this category and month"}` |

---

### `PUT /api/budgets/:id`

> تعديل حد الميزانية الشهرية

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |
| **ملاحظات أمان** | يتحقق أن الميزانية تابعة للمستخدم (يمنع IDOR) |

**📥 Request Body:**
```json
{
  "limit_amount": 3500
}
```

**📤 Response — `200 OK`:**
```json
{
  "budget": {
    "id": 1,
    "category_id": 1,
    "limit_amount": "3500.00",
    "current_spent": "1250.00",
    "month_year": "2026-03"
  }
}
```

---

## 8. Sync (Offline) 🔁

### `POST /api/sync/batch`

> مزامنة مجموعة عمليات من الموبايل (Offline → Online)

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |
| **Idempotency** | ✅ كل عملية لازم يكون ليها `idempotencyKey` فريد |
| **ملاحظات** | الموبايل يجمع العمليات في SQLite لما يكون offline. لما يرجع online يبعتهم كلهم مرة واحدة. العمليات المكررة (نفس idempotencyKey) بتترفض بدون خطأ |
| **الحد الأقصى** | 50 عملية في الطلب الواحد |

**📥 Request Body:**
```json
{
  "transactions": [
    {
      "amount": 150,
      "type": "manual_expense",
      "category_id": 1,
      "description": "خضار",
      "idempotencyKey": "local-uuid-001",
      "created_at": "2026-03-02T09:30:00Z"
    },
    {
      "amount": 50,
      "type": "manual_expense",
      "category_id": 2,
      "description": "مواصلات",
      "idempotencyKey": "local-uuid-002",
      "created_at": "2026-03-02T10:00:00Z"
    },
    {
      "amount": 5000,
      "type": "manual_income",
      "category_id": 9,
      "description": "مرتب",
      "idempotencyKey": "local-uuid-003",
      "created_at": "2026-03-01T08:00:00Z"
    }
  ]
}
```

**📤 Response — `200 OK`:**
```json
{
  "results": [
    { "idempotencyKey": "local-uuid-001", "status": "created",   "id": "tx-uuid-new-1" },
    { "idempotencyKey": "local-uuid-002", "status": "created",   "id": "tx-uuid-new-2" },
    { "idempotencyKey": "local-uuid-003", "status": "duplicate", "id": "tx-uuid-existing" }
  ],
  "summary": {
    "total": 3,
    "created": 2,
    "duplicates": 1,
    "failed": 0
  }
}
```

---

## 9. AI Engine 🤖

> **المتطلبات:** Google Gemini Flash API Key في `.env`  
> **ملاحظة:** هذه الـ endpoints للمرحلة الثانية من المشروع

### `POST /api/ai/parse-expense`

> تحويل نص طبيعي (عربي/إنجليزي) إلى بيانات مهيكلة باستخدام Gemini

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |
| **AI Model** | Gemini Flash (سريع ومجاني) |
| **ملاحظات** | بعد التحليل، يُسجل العملية تلقائياً في الـ transactions مع `ai_metadata` |

**📥 Request Body:**
```json
{
  "text": "جبت خضار بـ 150 جنيه من السوق",
  "idempotencyKey": "ai-uuid-001"
}
```

| الحقل | النوع | مطلوب | القيود |
|-------|-------|:-----:|--------|
| `text` | string | ✅ | 3-500 حرف |
| `idempotencyKey` | string (UUID) | ✅ | فريد |

**📤 Response — `201 Created`:**
```json
{
  "parsed": {
    "amount": 150,
    "category": "Food & Drinks",
    "category_id": 1,
    "label": "خضار",
    "confidence": 0.95
  },
  "transaction": {
    "id": "tx-uuid-...",
    "amount": "-150.00",
    "type": "ai_expense",
    "category": "Food & Drinks",
    "new_balance": "4700.00",
    "ai_metadata": {
      "original_text": "جبت خضار بـ 150 جنيه من السوق",
      "model": "gemini-flash",
      "parsed_at": "2026-03-03T12:00:00Z"
    },
    "created_at": "2026-03-03T12:00:00Z"
  }
}
```

---

### `POST /api/ai/advice`

> نصيحة مالية مخصصة بناءً على تحليل مصاريف المستخدم

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |
| **ملاحظات** | يقرأ transactions آخر 3 شهور + budgets ويرسلهم لـ Gemini |

**📥 Request:** لا يحتاج body

**📤 Response — `200 OK`:**
```json
{
  "advice": {
    "summary": "إنفاقك على الأكل زاد 30% عن الشهر اللي فات",
    "tips": [
      "حاول تطبخ في البيت أكتر — ده ممكن يوفرلك 800 جنيه",
      "اشتراك Netflix + Spotify = 350 جنيه — شوف لو محتاجهم فعلاً",
      "فاتورة الكهرباء عالية — فكر في لمبات LED"
    ],
    "savings_potential": 1150,
    "top_spending_categories": [
      { "category": "Food & Drinks", "amount": 4500, "percentage": 35 },
      { "category": "Entertainment", "amount": 2000, "percentage": 15 },
      { "category": "Utilities",     "amount": 1800, "percentage": 14 }
    ]
  }
}
```

---

### `POST /api/ai/chat`

> شات بوت مالي تفاعلي

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |
| **ملاحظات** | يستخدم context المستخدم المالي + الرسائل السابقة |

**📥 Request Body:**
```json
{
  "message": "إزاي أوفر 2000 جنيه الشهر الجاي؟"
}
```

**📤 Response — `200 OK`:**
```json
{
  "reply": "بناءً على مصاريفك الشهر ده:\n\n1. الأكل بره = 2500 جنيه — لو قللته للنص هتوفر 1250\n2. مواصلات = 900 جنيه — لو استخدمت المترو يومين هتوفر 400\n3. اشتراكات = 350 جنيه — لو لغيت واحد هتوفر 150\n\nالمجموع المتوقع: ~1800 جنيه توفير 💰",
  "context": {
    "current_month_expenses": 12800,
    "current_month_income": 15000
  }
}
```

---

## 10. Analytics & Dashboard 📈

### `GET /api/analytics/monthly`

> ملخص مالي شهري (للـ Dashboard)

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |

**📥 Query Parameters:**

| الحقل | النوع | مطلوب | افتراضي |
|-------|-------|:-----:|:-------:|
| `month` | string | ❌ | الشهر الحالي `2026-03` |

**📤 Response — `200 OK`:**
```json
{
  "analytics": {
    "month": "2026-03",
    "total_income": "15000.00",
    "total_expenses": "12800.00",
    "net_savings": "2200.00",
    "savings_rate": 14.67,
    "by_category": [
      { "category": "Food & Drinks",  "icon": "🍔", "amount": "4500.00", "percentage": 35.16 },
      { "category": "Transportation", "icon": "🚗", "amount": "2100.00", "percentage": 16.41 },
      { "category": "Entertainment",  "icon": "🎬", "amount": "2000.00", "percentage": 15.63 },
      { "category": "Utilities",      "icon": "💡", "amount": "1800.00", "percentage": 14.06 },
      { "category": "Shopping",       "icon": "🛒", "amount": "1500.00", "percentage": 11.72 },
      { "category": "Other",          "icon": "📦", "amount": "900.00",  "percentage": 7.03  }
    ],
    "transactions_count": 47
  }
}
```

---

### `GET /api/analytics/trends`

> اتجاهات الإنفاق على مدار عدة أشهر (للرسوم البيانية)

| البند | التفاصيل |
|-------|---------|
| **Auth** | ✅ Bearer Token |

**📥 Query Parameters:**

| الحقل | النوع | مطلوب | افتراضي | القيود |
|-------|-------|:-----:|:-------:|--------|
| `months` | number | ❌ | 6 | 1-12 |

**📤 Response — `200 OK`:**
```json
{
  "trends": [
    { "month": "2025-10", "income": "14000.00", "expenses": "11500.00", "savings": "2500.00" },
    { "month": "2025-11", "income": "14500.00", "expenses": "13000.00", "savings": "1500.00" },
    { "month": "2025-12", "income": "16000.00", "expenses": "14200.00", "savings": "1800.00" },
    { "month": "2026-01", "income": "15000.00", "expenses": "12000.00", "savings": "3000.00" },
    { "month": "2026-02", "income": "15000.00", "expenses": "11800.00", "savings": "3200.00" },
    { "month": "2026-03", "income": "15000.00", "expenses": "12800.00", "savings": "2200.00" }
  ]
}
```

---

## 🔒 ملخص متطلبات الأمان لكل Endpoint

| Endpoint | Auth | Idempotency | Redis Lock | DB Transaction | Rate Limit |
|----------|:----:|:-----------:|:----------:|:--------------:|:----------:|
| `POST /auth/signup` | ❌ | ❌ | ❌ | ✅ | ✅ (5/min) |
| `POST /auth/login` | ❌ | ❌ | ❌ | ❌ | ✅ (10/min) |
| `POST /auth/refresh-token` | ✅ | ❌ | ❌ | ❌ | ✅ (20/min) |
| `GET /user/profile` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PUT /user/profile` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PUT /user/password` | ✅ | ❌ | ❌ | ❌ | ✅ (3/min) |
| `GET /wallets` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /wallets/deposit` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `POST /wallets/withdraw` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `POST /transfers` | ✅ | ✅ | ✅✅ | ✅ (SERIALIZABLE) | ❌ |
| `GET /transactions` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET /transactions/:id` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /transactions/manual` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `POST /sync/batch` | ✅ | ✅ (per item) | ✅ | ✅ | ✅ (5/min) |
| `GET /categories` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /categories` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET /budgets` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /budgets` | ✅ | ❌ | ❌ | ✅ | ❌ |
| `PUT /budgets/:id` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /ai/parse-expense` | ✅ | ✅ | ✅ | ✅ | ✅ (30/min) |
| `POST /ai/advice` | ✅ | ❌ | ❌ | ❌ | ✅ (5/min) |
| `POST /ai/chat` | ✅ | ❌ | ❌ | ❌ | ✅ (20/min) |
| `GET /analytics/monthly` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET /analytics/trends` | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 📌 HTTP Status Codes المستخدمة

| Code | المعنى | متى يُستخدم |
|:----:|--------|-------------|
| `200` | OK | جلب بيانات ناجح / عملية مكررة (idempotent) |
| `201` | Created | إنشاء resource جديد (user, transaction, budget) |
| `400` | Bad Request | بيانات ناقصة أو غير صالحة |
| `401` | Unauthorized | توكن مفقود |
| `403` | Forbidden | توكن منتهي أو غير صالح |
| `404` | Not Found | resource غير موجود |
| `409` | Conflict | تعارض (رصيد غير كافي / عملية قيد المعالجة / user موجود) |
| `500` | Internal Server Error | خطأ في السيرفر |
