# TaskFlow – Mini SaaS Task Management System

A production-ready full-stack task management application with secure JWT authentication and multi-user support.

🔗 **Live Demo:** [saas-task-management-zq54.vercel.app](https://saas-task-management-zq54.vercel.app)  
🔗 **Backend API:** [saas-task-management-bjt2.vercel.app/api/health](https://saas-task-management-bjt2.vercel.app/api/health)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Supabase), Sequelize ORM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Validation | express-validator |
| Deployment | Vercel (frontend + backend), Supabase (DB) |

---

## ✨ Features Implemented

- **Authentication** – Signup, Login with JWT tokens; protected routes
- **Password Security** – bcrypt hashing (cost factor 10)
- **Task Management** – Create, read, update, delete tasks per user
- **Task Status** – Pending → In Progress → Completed lifecycle
- **Task Priority** – Low / Medium / High labels
- **Due Dates** – Optional due date per task
- **User Isolation** – Each user sees only their own tasks (no global tasks)
- **Search & Filter** – Filter by status, priority, and search by title
- **Responsive UI** – Clean dark-themed interface with Tailwind CSS
- **Error Handling** – Global error middleware with consistent JSON responses
- **Input Validation** – Server-side validation on all endpoints

---

## 📁 Project Structure

```
saas-task-management/
├── backend/
│   ├── config/         # Sequelize DB connection
│   ├── controllers/    # authController, taskController
│   ├── middleware/     # auth (JWT protect), errorHandler
│   ├── models/         # User, Task (Sequelize models)
│   ├── routes/         # /api/auth, /api/tasks
│   ├── utils/
│   ├── server.js       # Express app entry point
│   └── vercel.json     # Vercel serverless config
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth context (React Context API)
│   │   ├── hooks/      # Custom hooks
│   │   ├── pages/      # Login, Signup, Dashboard
│   │   └── services/   # axios API client
│   └── vite.config.js
└── docker-compose.yml  # Local PostgreSQL via Docker
```

---

## 🚀 Setup Steps

### Prerequisites
- Node.js 18+
- Docker (for local PostgreSQL)

### 1. Clone the repository
```bash
git clone https://github.com/Aditya-1025/Saas_Task_Management-.git
cd Saas_Task_Management-
```

### 2. Start the database
```bash
docker compose up -d postgres
```

### 3. Start the backend
```bash
cd backend
cp .env.example .env   # fill in your values
npm install
npm start
# Runs on http://localhost:5000
```

### 4. Start the frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Backend Environment Variables (`.env`)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get JWT | Public |
| GET | `/api/auth/me` | Get current user | 🔒 |
| GET | `/api/tasks` | Get all tasks (with filters) | 🔒 |
| POST | `/api/tasks` | Create a task | 🔒 |
| GET | `/api/tasks/:id` | Get single task | 🔒 |
| PUT | `/api/tasks/:id` | Update task | 🔒 |
| DELETE | `/api/tasks/:id` | Delete task | 🔒 |
