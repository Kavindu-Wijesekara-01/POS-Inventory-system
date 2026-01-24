# 🍔 Restaurant POS System (MERN Stack)

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![MERN](https://img.shields.io/badge/Stack-MERN-green)
![Status](https://img.shields.io/badge/Status-Development-orange)

> A modern, full-stack Point of Sale (POS) system designed for restaurants and retail shops. Built with the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

---

## 📸 Screenshots

| **POS Interface** | **Admin Dashboard** |
|:---:|:---:|
| ![POS Screen](/frontend/public/Screenshot%202026-01-23%20141830.png) | ![Admin Dashboard](/frontend/public/Screenshot%202026-01-23%20141923.png) |
| *Fast & Easy Checkout* | *Analytics & Management* |

---

## 🚀 Key Features

### 🛒 POS Terminal (Cashier View)
- **Fast Checkout:** Quick product selection with categories and search.
- **Cart Management:** Add, remove, and adjust quantities instantly.
- **Loyalty System:** Check customer loyalty points and apply discounts.
- **Order Hold:** (Planned) Ability to hold and retrieve orders.
- **Dynamic Receipts:** Generates printable receipts with shop details.

### 👨‍💼 Admin Dashboard
- **Sales Analytics:** View total revenue, discounts, and order counts with date filters.
- **Staff Management:** Register Admins and Cashiers with role-based access.
- **Product Management:** Add, update, and delete inventory items.
- **Sales History:** View past orders, reprint receipts, or delete records.
- **Shop Configuration:** Update shop name, address, and receipt footer message dynamically.

### 🔐 Security & Tech
- **Authentication:** Secure Login with JWT (JSON Web Tokens).
- **Role-Based Access Control (RBAC):** Separate views for Admins and Staff.
- **Protected Routes:** Prevents unauthorized access to Admin panels.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS, Lucide React (Icons), Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Cloud) |
| **Authentication** | JWT, Bcrypt.js |

---
## 🔑 Environment Configuration (Important)

⚠️ **Note:** The `.env` file is excluded from this repository for security reasons. You must create it manually to run the project.

### Step 1: Backend Configuration
1. Navigate to the **`backend`** folder.
2. Create a new file named **`.env`**.
3. Copy and paste the following code into it:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here


