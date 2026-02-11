# 📚 Library Management System (Fullstack)  
**(IT_4082 – Software Engineering Project)**

A **Full-Stack Web Application** for managing a library with **role-based access control** and a clean, modern UI.  
The system supports the complete workflow from **book browsing → cart → checkout (borrow order) → librarian approval/issue → fines & payments**.

---

## 💻 Tech Stack

| Category | Technologies |
|:----------|:-------------|
| **Frontend** | React, Vite, React Router DOM, Axios |
| **State Management** | Zustand (persist) |
| **Backend** | Node.js, Express.js |
| **ORM** | Prisma |
| **Database** | MySQL / PostgreSQL / SQLite (via `.env`) |
| **Authentication & Security** | JWT, bcryptjs (depending on your implementation) |
| **Development Tools** | Git, GitHub, VS Code |

---

## 🧭 Features

| Role | Main Responsibilities |
|:-----|:-----------------------|
| **Admin** | Manage users/roles, CRUD system data (based on implementation) |
| **Librarian** | Approve/issue/return borrowings, track due dates and overdue |
| **Accountant** | Manage fines, confirm payments |
| **Reader** | Browse books, search, add to cart, checkout, view orders/borrows/fines/dashboard |

---

## ✨ Core Modules

### 👤 Reader Module
- Browse books in a **grid layout with cover images**
- Search books by keyword
- Add books to a **borrowing cart** (Zustand persist)
- Checkout borrowing order:
  - choose **loan days**
  - add a **note**
  - choose payment option (**mock online / pay at counter**)
- View:
  - **My Orders**
  - **Borrow History**
  - **My Fines**
  - **Reader Dashboard** (statistics)

### 📗 Librarian Module
- Handle borrowings:
  - approve/issue orders
  - return books
  - track due date and overdue status (based on backend rules)

### 🧾 Accountant Module
- View fines list
- Filter fines by status: **All / Unpaid / Paid**
- Pay a fine with one click

### 🛠️ Admin Module
- Manage users and permissions
- CRUD entities (depending on implementation)

---


## 🖼️ DEMO

### 👩‍💼 Staff Interfaces (Admin / Librarian / Accountant)

<p align="center">
  <img src="./docs/demo/login.png" width="700" alt="Login Page" />
</p>

#### 🔹 Step-by-Step

1. **Login**  
   → Access the dashboard based on assigned role permissions.  
   <p align="center">
      <img src="./docs/demo/staff-dashboard-1.png" width="700" alt="Staff Dashboard 1" />
   </p>

2. **Book Management (optional if implemented)**  
   → Create/update books, upload covers, manage copies.  
   <p align="center"><img src="./docs/demo/book-detail.png" width="700" alt="Book Detail" /></p>

3. **Borrowing Workflow (Librarian)**  
   → View orders, approve/issue borrowings, track due/overdue, process returns.  
   <p align="center"><img src="./docs/demo/librarian-borrowings.png" width="700" alt="Borrowings" /></p>
   <p align="center"><img src="./docs/demo/librarian-borrow-detail.png" width="700" alt="Borrow Detail" /></p>

4. **Fines & Payments (Accountant)**  
   → View fines, filter by status, mark paid.  
   <p align="center"><img src="./docs/demo/accountant-fines.png" width="700" alt="Accountant Fines" /></p>

5. **User Management (Admin)**  
   → Create/update users and assign roles.  
   <p align="center"><img src="./docs/demo/admin-users.png" width="700" alt="Admin Users" /></p>

---

### 🏠 Reader Interface

#### 🔹 Step-by-Step

1. **Browse Books (Reader Shop)**  
   → Search, view books, add to cart.  
   <p align="center"><img src="./docs/demo/reader-shop.png" width="700" alt="Reader Shop" /></p>

2. **Cart**  
   → Manage quantities and selected books.  
   <p align="center"><img src="./docs/demo/reader-cart.png" width="700" alt="Reader Cart" /></p>

3. **Checkout (Borrow Order)**  
   → Choose loan days, note, payment option, then create order.  
   <p align="center"><img src="./docs/demo/reader-checkout1.png" width="700" alt="Reader Checkout" /></p>


4. **My Orders & Borrow History**  
   → Track approval/issue status and due dates.  
   <p align="center"><img src="./docs/demo/reader-orders.png" width="700" alt="Reader Orders" /></p>
   <p align="center"><img src="./docs/demo/reader-borrows.png" width="700" alt="Reader Borrow History" /></p>

5. **Fines**  
   → View fine list and status.  
   <p align="center"><img src="./docs/demo/reader-fines.png" width="700" alt="Reader Fines" /></p>

6. **Reader Dashboard**  
   → View statistics and overview.  
   <p align="center"><img src="./docs/demo/reader-dashboard.png" width="700" alt="Reader Dashboard" /></p>

---

## 🚀 Run the Project on Your Machine

### ⚙️ Prerequisites
Before starting, make sure you have installed:
- **Node.js** ≥ 18.x  
- **npm** ≥ 9.x  
- **Database**: MySQL / PostgreSQL / SQLite  
- **Git**

---

### 🧱 1. Clone Repository

| Step | Command |
|:-----|:---------|
| Clone the project | `git clone https://github.com/trg-ggiang/library-management-system.git` |
| Move into folder | `cd library-management-system` |

---

### 🗃️ 2. Database Setup

Create `.env` in **server/** (or backend folder) depending on your structure:

```env
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/library_db"
PORT=5000
JWT_SECRET="your_secret_here"
