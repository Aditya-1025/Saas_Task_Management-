# TaskFlow – Mini SaaS Task Management

A production-ready full-stack SaaS task management application with secure multi-user authentication, built as part of a Full Stack Developer Intern screening test.

## 🚀 Live Demo
> Deploy link goes here after deployment (Render / Railway / Vercel)

## 📷 Features
- ✅ **JWT Authentication** – Secure signup & login with bcrypt password hashing
- ✅ **Multi-User Task Isolation** – Each user sees only their own tasks
- ✅ **Full Task CRUD** – Create, view, update status, and delete tasks
- ✅ **Priority & Status Tracking** – Low / Medium / High priority; Pending / In Progress / Completed
- ✅ **Search & Filters** – Real-time search, filter by status and priority
- ✅ **Protected Routes** – Frontend and backend route protection
- ✅ **Input Validation** – Server-side validation with `express-validator`
- ✅ **Error Handling** – Global error middleware with structured JSON responses
- ✅ **Responsive UI** – Dark-mode, glassmorphism design with Tailwind CSS v4

## 🛠 Tech Stack

| Layer      | Technology                                         |
|------------|---------------------------------------------------|
| Backend    | Node.js, Express.js                               |
| Database   | PostgreSQL + Sequelize ORM                        |
| Auth       | JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`)         |
| Frontend   | React 19, Vite, Tailwind CSS v4                   |
| HTTP       | Axios with interceptors                            |
| UI         | Lucide React icons, `react-hot-toast`             |
| Validation | `express-validator`                               |

## 📁 Project Structure

```
saas-task-management/
├── backend/
│   ├── config/         # Database config
│   ├── controllers/    # authController, taskController
│   ├── middleware/     # auth (JWT), errorHandler
│   ├── models/         # User, Task (Sequelize)
│   ├── routes/         # /api/auth, /api/tasks
│   ├── server.js       # Express entry point
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── context/    # AuthContext (JWT state)
    │   ├── pages/      # LoginPage, SignupPage, DashboardPage
    │   ├── services/   # api.js (Axios)
    │   ├── App.jsx     # Router + guards
    │   └── main.jsx
    └── vite.config.js
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js ≥ 18
- PostgreSQL (local or cloud like Supabase / Neon)

### 1. Clone the repository
```bash
git clone https://github.com/Aditya-1025/Saas_Task_Management-.git
cd Saas_Task_Management-
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials and JWT secret
npm install
npm run dev        # Starts on http://localhost:5000
```

#### Environment variables (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

> The database tables are **auto-synced** on startup (`sequelize.sync({ alter: true })`). No migrations needed for local dev.

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev        # Starts on http://localhost:5173
```

### 4. Database setup (PostgreSQL)
```sql
CREATE DATABASE taskflow_db;
```

That's it! Sequelize will create the `users` and `tasks` tables automatically.

## 🔌 API Endpoints

### Auth
| Method | Endpoint           | Access  | Description       |
|--------|--------------------|---------|-------------------|
| POST   | `/api/auth/signup` | Public  | Register new user |
| POST   | `/api/auth/login`  | Public  | Login + get JWT   |
| GET    | `/api/auth/me`     | Private | Get current user  |

### Tasks (all require `Authorization: Bearer <token>`)
| Method | Endpoint          | Description                      |
|--------|-------------------|----------------------------------|
| GET    | `/api/tasks`      | List tasks (filter/search/page)  |
| POST   | `/api/tasks`      | Create task                      |
| GET    | `/api/tasks/:id`  | Get single task                  |
| PUT    | `/api/tasks/:id`  | Update task                      |
| DELETE | `/api/tasks/:id`  | Delete task                      |

### Query parameters for `GET /api/tasks`
- `status` – `pending` | `in_progress` | `completed`
- `priority` – `low` | `medium` | `high`
- `search` – title substring search (case-insensitive)
- `page`, `limit` – pagination (default: page 1, limit 20)

## 🚢 Deployment

### Backend (Render / Railway)
1. Connect your GitHub repo
2. Set `Root Directory` to `backend`
3. Add all env vars from `.env.example`
4. Build command: `npm install`
5. Start command: `node server.js`

### Frontend (Vercel / Netlify)
1. Connect your GitHub repo
2. Set `Root Directory` to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set env var: `VITE_API_URL=https://your-backend.render.com`  
   (Update `src/services/api.js` `baseURL` to use this if deploying separately)

## 📝 License
MIT
