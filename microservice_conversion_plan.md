# 🏗️ Microservice Architecture Conversion Plan

> **POS-Inventory System** — Monolith → Microservice (Expert-Level Conversion)

## Current Monolith Analysis

The existing monolithic backend runs as a **single Express server on port 5000** with 6 models, 6 controllers, and 6 route files — all sharing one MongoDB connection.

### Current API Map (Frontend → Backend)

| Frontend Component | API Endpoint | Backend Controller |
|---|---|---|
| `Login.jsx` | `POST /api/auth/login` | `authController.loginUser` |
| `StaffManagement.jsx` | `GET /api/staff` | `staffController.getAllStaff` |
| `StaffManagement.jsx` | `POST /api/auth/register` | `authController.registerUser` |
| `StaffManagement.jsx` | `DELETE /api/staff/:id` | `staffController.deleteStaff` |
| `POSContext.jsx` | `GET /api/inventory/categories` | `inventoryController.getCategories` |
| `POSContext.jsx` | `GET /api/inventory/products` | `inventoryController.getProducts` |
| `POSContext.jsx` | `GET /api/orders/analytics` | `orderController.getAnalytics` |
| `CategoryManagement.jsx` | CRUD `/api/inventory/categories` | `inventoryController.*Category` |
| `ProductManagement.jsx` | CRUD `/api/inventory/products` | `inventoryController.*Product` |
| `LoyaltyManagement.jsx` | CRUD `/api/loyalty` | `loyaltyController.*` |
| `POSPage.jsx` | `POST /api/loyalty/check` | `loyaltyController.checkLoyalty` |
| `POSPage.jsx` | `POST /api/loyalty/add` | `loyaltyController.addLoyaltyMember` |
| `PaymentPage.jsx` | `GET /api/settings` | `settingController.getSettings` |
| `PaymentPage.jsx` | `POST /api/orders` | `orderController.createOrder` |
| `SalesManagement.jsx` | `GET /api/orders` | `orderController.getOrders` |
| `SalesManagement.jsx` | `DELETE /api/orders/:id` | `orderController.deleteOrder` |
| `SalesManagement.jsx` | `GET /api/settings` | `settingController.getSettings` |
| `ShopSettings.jsx` | `GET /api/settings` | `settingController.getSettings` |
| `ShopSettings.jsx` | `PUT /api/settings` | `settingController.updateSettings` |
| `AnalyticsDashboard.jsx` | `GET /api/orders/analytics` | `orderController.getAnalytics` |

---

## Microservice Architecture Design

### 5 Independent Services + 1 API Gateway

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│                     baseURL: http://localhost:3000             │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    API Gateway (Port 3000)                     │
│              Nginx — Reverse Proxy + Load Balancer             │
│  /api/auth/*       → auth-service:5001                        │
│  /api/inventory/*  → inventory-service:5002                   │
│  /api/orders/*     → order-service:5003                       │
│  /api/loyalty/*    → loyalty-service:5004                     │
│  /api/settings/*   → settings-service:5005                    │
│  /api/staff/*      → auth-service:5001                        │
└──────────┬─────────┬──────────┬───────────┬──────────┬───────┘
           │         │          │           │          │
     ┌─────▼──┐ ┌────▼───┐ ┌───▼────┐ ┌────▼───┐ ┌───▼─────┐
     │  Auth  │ │Inventory│ │ Order  │ │Loyalty │ │Settings │
     │Service │ │ Service │ │Service │ │Service │ │ Service │
     │ :5001  │ │  :5002  │ │ :5003  │ │ :5004  │ │  :5005  │
     │        │ │         │ │        │ │        │ │         │
     │ User   │ │Category │ │ Order  │ │Loyalty │ │Setting  │
     │ Model  │ │Product  │ │ Model  │ │ Model  │ │ Model   │
     │        │ │ Models  │ │        │ │        │ │         │
     └───┬────┘ └───┬─────┘ └───┬────┘ └───┬────┘ └───┬─────┘
         │          │           │          │          │
         ▼          ▼           ▼          ▼          ▼
    ┌─────────────────────────────────────────────────────┐
    │            MongoDB Atlas (Shared Cloud DB)           │
    │  Each service uses its OWN database/collection      │
    └─────────────────────────────────────────────────────┘
```

### Service Boundaries (Domain-Driven Design)

| # | Service | Port | Models | Routes | Purpose |
|---|---------|------|--------|--------|---------|
| 1 | **auth-service** | 5001 | `User` | `/api/auth/*`, `/api/staff/*` | Login, Register, JWT, Staff CRUD |
| 2 | **inventory-service** | 5002 | `Category`, `Product` | `/api/inventory/*` | Category & Product CRUD |
| 3 | **order-service** | 5003 | `Order` | `/api/orders/*` | Order CRUD, Analytics, Date Filters |
| 4 | **loyalty-service** | 5004 | `Loyalty` | `/api/loyalty/*` | Loyalty Members, Check, Add |
| 5 | **settings-service** | 5005 | `Setting` | `/api/settings/*` | Shop Config (name, tax, footer) |

### Why this split?

- **Auth + Staff** belong together — both operate on the `User` model
- **Category + Product** belong together — Products reference Categories (`.populate('category')`)
- **Order** is standalone — it references Loyalty by ObjectId but only for `.populate('customer', 'name')` (can work independently)
- **Loyalty** is standalone — no external model dependencies
- **Settings** is standalone — no external model dependencies

---

## File Structure After Conversion

```
POS-Inventory-system/
├── services/
│   ├── auth-service/
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── staffRoutes.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── server.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── .env
│   │
│   ├── inventory-service/
│   │   ├── controllers/
│   │   │   └── inventoryController.js
│   │   ├── models/
│   │   │   ├── Category.js
│   │   │   └── Product.js
│   │   ├── routes/
│   │   │   └── inventoryRoutes.js
│   │   ├── server.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── .env
│   │
│   ├── order-service/
│   │   ├── controllers/
│   │   │   └── orderController.js
│   │   ├── models/
│   │   │   └── Order.js
│   │   ├── routes/
│   │   │   └── orderRoutes.js
│   │   ├── server.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── .env
│   │
│   ├── loyalty-service/
│   │   ├── controllers/
│   │   │   └── loyaltyController.js
│   │   ├── models/
│   │   │   └── Loyalty.js
│   │   ├── routes/
│   │   │   └── loyaltyRoutes.js
│   │   ├── server.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── .env
│   │
│   └── settings-service/
│       ├── controllers/
│       │   └── settingController.js
│       ├── models/
│       │   └── Setting.js
│       ├── routes/
│       │   └── settingRoutes.js
│       ├── server.js
│       ├── package.json
│       ├── Dockerfile
│       └── .env
│
├── frontend/                    # (React app — minimal changes)
│   └── src/api/axios.js         # baseURL → API Gateway port (3000)
│
├── gateway/
│   └── nginx.conf               # Reverse proxy config
│
├── docker-compose.yml           # Orchestrates all 5 services + gateway
├── .env                         # Shared env variables
└── README.md
```

---

## Key Design Decisions

> [!IMPORTANT]
> ### 1. Frontend stays UNCHANGED
> The frontend currently calls `http://localhost:5000/api/*`. After conversion, Nginx API Gateway sits on a single port and routes to the correct service. We only change `baseURL` in `axios.js`.

> [!IMPORTANT]
> ### 2. Database per Service (Logical Separation)
> Each service connects to the **same MongoDB Atlas cluster** but uses its own database name (e.g., `pos_auth_db`, `pos_inventory_db`). This gives data isolation without needing multiple clusters.

> [!IMPORTANT]
> ### 3. Order ↔ Loyalty cross-reference
> The `Order` model has `customer: { type: ObjectId, ref: 'Loyalty' }` with `.populate()`. In microservices, cross-service `.populate()` won't work. The Order service will store `customerName` as a string directly (denormalization) OR make an HTTP call to the Loyalty service when needed.

> [!IMPORTANT]
> ### 4. Each service is independently deployable
> Each service has its own `package.json`, `Dockerfile`, `server.js`, and `.env`. They can be scaled, updated, and restarted independently.

---

## Implementation Phases

### Phase 1: Create the 5 microservices
- Extract each domain into its own service directory
- Each service gets its own Express server, port, and MongoDB connection
- Handle the Order→Loyalty cross-reference via denormalization

### Phase 2: API Gateway (Nginx)
- Create `nginx.conf` that routes `/api/auth/*` → auth-service, etc.
- Single entry point for the frontend

### Phase 3: Docker Containerization
- Write `Dockerfile` for each service and the frontend
- Create `docker-compose.yml` to orchestrate everything

### Phase 4: Frontend Update
- Change `axios.js` `baseURL` to point to the API Gateway
- Zero other frontend changes needed

---

> [!TIP]
> **Proceed?** Click "Proceed" to start building all 5 microservices, the API Gateway, Docker configuration, and update the frontend. The existing `backend/` folder will be preserved — all new code goes into `services/` and `gateway/`.
