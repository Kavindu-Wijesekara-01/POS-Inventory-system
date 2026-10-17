# 🛒 POS & Inventory Management System (Enterprise DevSecOps Edition)

![Build & Security](https://img.shields.io/badge/Security-DevSecOps%20Automated-brightgreen)
![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Docker](https://img.shields.io/badge/Containers-Docker%20Compose-2496ED)
![NodeJS](https://img.shields.io/badge/Node.js-v22%20LTS-green)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Tailwind%20%2B%20Vite-61DAFB)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

> An enterprise-grade, containerized Point of Sale (POS) and Inventory Management System transformed into a secure **Microservices Architecture** with a fully automated **10-stage DevSecOps CI/CD Pipeline**, specifically optimized to run within **1 GB RAM (AWS EC2 t2.micro)** free-tier environments.

---

## 📸 Screenshots

| **POS Interface (Cashier Checkout)** | **Admin Dashboard (Analytics & Inventory)** |
|:---:|:---:|
| ![POS Screen](/frontend/public/Screenshot%202026-01-23%20141830.png) | ![Admin Dashboard](/frontend/public/Screenshot%202026-01-23%20141923.png) |
| *Fast Checkout, Real-time Cart, Instant Billing* | *Role-Based Access, Product Management, Reports* |

---

## 🏗️ Architecture Overview

The system has been transformed from a monolithic backend into a decoupled, highly-efficient **Microservices Architecture** with an **Nginx API Gateway**:

```
                              [ Web Browser / Client ]
                                         │
                                         ▼ (Port 3000)
                           ┌───────────────────────────┐
                           │   Nginx API Gateway       │
                           │   (Reverse Proxy & WAF)   │
                           └─────────────┬─────────────┘
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
                 ▼                       ▼                       ▼
      ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
      │   Auth Service      │ │  Inventory Service  │ │    Order Service    │
      │   (Port 5001)       │ │  (Port 5002)        │ │    (Port 5003)      │
      │   - Staff & Users   │ │  - Products         │ │  - Cart & Checkout  │
      │   - JWT Auth / RBAC │ │  - Categories       │ │  - Order Invoicing  │
      │   - Health / Metrics│ │  - Stock Levels     │ │  - Sales Records    │
      └──────────┬──────────┘ └──────────┬──────────┘ └──────────┬──────────┘
                 │                       │                       │
                 ▼                       ▼                       ▼
      [ MongoDB: pos_auth ]   [ MongoDB: pos_inv ]   [ MongoDB: pos_order ]
```

* **Frontend SPA Container:** Multi-stage production build served via ultra-lightweight Nginx container (Port 80 internally, mapped through Gateway).
* **Network Isolation:** Internal Docker bridge network (`pos-microservices-network`). Only the API Gateway is exposed to the host.

---

## 🛡️ DevSecOps CI/CD Pipeline (Shift-Left Security)

Automated GitHub Actions workflow (`.github/workflows/devsecops-pipeline.yml`) enforcing security at every stage:

| Stage | Security Tool | Purpose & Gate Condition |
| :--- | :--- | :--- |
| **1. Pre-Flight** | **TruffleHog OSS** | Scans full Git history for leaked secrets, tokens, and committed `.env` files. |
| **2. SAST** | **Semgrep** | Static analysis scanning for OWASP Top 10, Express security flaws, and JWT vulnerabilities. |
| **3. SCA** | **OWASP Dependency-Check** | Software Composition Analysis detecting known CVEs in third-party npm packages (CVSS ≥ 7 fails). |
| **4. Unit Tests** | **Jest** | Automated parallel unit and integration tests with code coverage artifacts. |
| **5. Container Build**| **Docker Buildx & Syft** | Multi-stage hardened image builds with SLSA provenance and CycloneDX Software Bill of Materials (SBOM). |
| **6. Image Scan** | **Aqua Trivy** | Container vulnerability scanner blocking deployments on `CRITICAL` or `HIGH` OS/library CVEs. |
| **7. Staging Deploy** | **Docker Compose** | Automated staging deployment and multi-service smoke tests against `/health` endpoints. |
| **8. DAST** | **OWASP ZAP Baseline** | Dynamic API testing against live running endpoints to catch runtime vulnerabilities. |
| **9. Production** | **SSH / Compose Deploy** | Zero-downtime rolling deployment to production host triggered only on `main` branch. |
| **10. Audit & Alerts** | **GitHub Summary & Slack** | Generates centralized security dashboards and instant Slack alerts on pipeline failures. |

---

## ⚡ 1 GB RAM (AWS Free-Tier) Optimizations

Engineered specifically to run flawlessly on low-spec cloud instances like **AWS EC2 `t2.micro` (1 vCPU, 1 GB RAM)**:

1. **Microservices Streamlining:** Pruned unnecessary standalone services into 3 pure core microservices (Auth, Inventory, Orders).
2. **Frontend Optimization:** Replaced heavy `vite dev` server container (~300 MB) with an Nginx static production build (~15 MB).
3. **Node.js Memory Constraints:** Injected `NODE_OPTIONS="--max-old-space-size=128"` on all backend services to prevent V8 garbage collection bloat.
4. **Docker Resource Limits:** Strict `mem_limit: 160m` applied on all services, guaranteeing that total container memory footprint remains under **~450 MB**, leaving >500 MB headroom for Linux OS and kernel caches.
5. **Disk Swap Protection:** 2 GB Swap file configuration to eliminate any possibility of Out-Of-Memory (OOM) process termination.

---

## 🚀 Quick Start & Deployment Guide

### Prerequisites
* Docker & Docker Compose v2+
* Node.js 22+ (for local host development)
* MongoDB Atlas cluster connection string

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/POS-Inventory-system.git
cd POS-Inventory-system
```

### 2. Configure Environment Variables
Copy the template and fill in your MongoDB Atlas connection strings:
```bash
cp .env.example .env
nano .env
```

```env
MONGO_URI_AUTH=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/pos_auth_db?retryWrites=true&w=majority
MONGO_URI_INVENTORY=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/pos_inventory_db?retryWrites=true&w=majority
MONGO_URI_ORDER=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/pos_order_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. Build & Run Containers
```bash
docker compose up -d --build
```

Verify all services are running and healthy:
```bash
docker compose ps
```

Access the system in your browser at:
👉 **`http://localhost:3000`** (or `http://<EC2-PUBLIC-IP>:3000`)

---

## 👤 Initial Admin Account Creation

Since credentials are not hardcoded for security, initialize the first Admin account using `curl`:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "staffId": "ADM001",
    "username": "admin",
    "password": "admin123",
    "role": "admin"
  }'
```

* **Admin Username:** `admin`
* **Admin Password:** `admin123`
*(Roles available: `admin` for Full Dashboard Access, `user` for POS Cashier Terminal).*

---

## 📁 Repository Structure

```
├── .github/
│   ├── workflows/
│   │   └── devsecops-pipeline.yml   # 10-Stage DevSecOps CI/CD pipeline
│   ├── owasp-suppressions.xml       # Dependency-Check false positive rules
│   └── zap-rules.tsv                # OWASP ZAP DAST scan thresholds
├── gateway/
│   └── nginx.conf                   # Reverse proxy routing & security headers
├── services/
│   ├── auth-service/                # Port 5001: JWT, Staff, Authentication
│   ├── inventory-service/           # Port 5002: Products, Categories, Stock
│   └── order-service/               # Port 5003: Orders, Invoices, Billing
├── frontend/                        # React SPA (Tailwind CSS, Vite, Nginx)
├── monitoring/
│   └── prometheus.yml               # Service discovery metrics configuration
├── scripts/
│   └── security/
│       └── pre-commit               # Git secret detection pre-commit hook
├── docker-compose.yml               # Base multi-container definition with memory limits
├── docker-compose.staging.yml       # Staging override configuration
└── .env.example                     # Environment configuration template
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
