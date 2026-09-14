# 🚀 Job Portal Platform

A modern, full-stack, enterprise-grade Job Matching and Career Management Platform designed to connect job seekers (students/candidates) with employers and administrators. Built with a **Django REST Framework** backend, **React 19 & Vite** frontend, and powered by a smart **Weighted Recommendation Engine**.

---

## 🌟 Key Features

### 👨‍🎓 Candidate & Student Experience
- **Interactive Dashboard**: Real-time stats on application progress, saved jobs, notifications, and top job matches.
- **Job Discovery & Search**: Advanced filtering by title, skills, location, work mode (Remote, Hybrid, Onsite), and employment type.
- **Detailed Job Views**: Single-click job application, candidate profile preview, and resume selection.
- **Resume Manager**: Upload, manage, and mark primary resumes (PDF/DOCX support).
- **Application Tracker**: Monitor application statuses in real-time (`applied`, `reviewing`, `shortlisted`, `interviewing`, `accepted`, `rejected`).
- **Bookmark / Saved Jobs**: Easily save listings for quick access.
- **Notification Hub**: Instant notifications for status updates and high-match job opportunities.

### 🛡️ Admin & Recruiter Portal
- **Management Dashboard**: Platform-wide analytics including total jobs, active applications, pending reviews, and registered companies.
- **Job Management System**: Create, update, publish, or archive job postings with custom required skill tags and compensation ranges.
- **Company Directory Management**: Create, view, and verify employer company profiles.
- **Candidate Application Review**: Inspect candidate submissions, view uploaded resumes, write notes, and transition application statuses.

### 🤖 Smart Recommendation Engine
- Custom algorithmic match scoring based on a weighted evaluation model:
  - **Skill Compatibility (50%)**: Compares candidate's skills against job requirement tags.
  - **Experience Level (20%)**: Evaluates candidate experience relative to post requirements.
  - **Location Alignment (10%)**: Checks candidate preferred location vs job location.
  - **Work Mode Preference (10%)**: Evaluates Remote, Hybrid, or Onsite alignment.
  - **Employment Type Preference (10%)**: Full-time, Part-time, Internship, or Contract.

---

## 🛠️ Tech Stack

### Backend
| Technology | Description |
| :--- | :--- |
| **Python 3.10+** | Programming language |
| **Django 5.x** | Core web framework |
| **Django REST Framework (DRF)** | RESTful API architecture |
| **SimpleJWT** | Secure JWT Authentication (Access & Refresh tokens) |
| **SQLite / PostgreSQL** | Relational database (SQLite for development) |
| **Celery & Redis** | Asynchronous task queue and caching integration |
| **django-cors-headers** | Cross-Origin Resource Sharing handling |

### Frontend
| Technology | Description |
| :--- | :--- |
| **React 19** | User interface library |
| **Vite 8** | Next-generation frontend build tooling & HMR |
| **Tailwind CSS v4** | Modern utility-first CSS framework |
| **React Router v7** | Single Page Application (SPA) routing |
| **Axios** | HTTP client with automatic token refresh interceptors |
| **Framer Motion** | Smooth UI micro-animations and transitions |
| **Lucide React** | Modern SVG icon suite |

---

## 📁 Project Architecture

```
job_portal/
├── backend/
│   ├── apps/
│   │   ├── accounts/          # User model (Student, Recruiter, Admin), Auth endpoints
│   │   ├── profiles/          # Student & Recruiter profile schemas & APIs
│   │   ├── resumes/           # Resume document handling & file management
│   │   ├── companies/         # Company profile & verification management
│   │   ├── jobs/              # Job posting CRUD, search, and bookmarking
│   │   ├── applications/     # Job application workflow & status state machine
│   │   ├── recommendations/  # Weighted job recommendation scoring engine
│   │   ├── notifications/    # In-app notifications & alert dispatcher
│   │   └── common/           # Custom exception handling, admin utilities, pagination
│   ├── config/                # Django project config (settings, URLs, ASGI/WSGI)
│   ├── db.sqlite3            # Development database
│   └── manage.py              # Django CLI entrypoint
│
├── frontend/
│   ├── public/                # Static assets & favicon
│   ├── src/
│   │   ├── api/               # Axios client instance with auth interceptors
│   │   ├── components/        # Reusable UI components (Navbar, Footer, Modals)
│   │   ├── context/           # AuthContext & global state management
│   │   ├── pages/             # Page components (Candidate, Admin, Auth, Public)
│   │   ├── App.jsx            # Main App layout & React Router routes
│   │   ├── index.css          # Global styling & Tailwind CSS imports
│   │   └── main.jsx           # React app entry point
│   ├── package.json           # Node dependencies & scripts
│   └── vite.config.js         # Vite configuration with backend API proxy
│
└── README.md                  # Project documentation
```

---

## 🔗 API Endpoints Overview

All REST API endpoints are namespaced under `/api/v1/`:

| Module | Route Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/v1/auth/register/` | `POST` | Register a new user (`STUDENT` or `RECRUITER`) |
| **Auth** | `/api/v1/auth/token/` | `POST` | Obtain JWT access & refresh tokens |
| **Auth** | `/api/v1/auth/token/refresh/` | `POST` | Refresh expired access token |
| **Profiles** | `/api/v1/profile/` | `GET / PUT` | Retrieve or update current user profile |
| **Resumes** | `/api/v1/resumes/` | `GET / POST` | Upload and list candidate resumes |
| **Companies** | `/api/v1/companies/` | `GET / POST` | Directory of registered companies |
| **Jobs** | `/api/v1/jobs/` | `GET` | List active jobs with search & filter parameters |
| **Jobs** | `/api/v1/jobs/:id/` | `GET` | Retrieve single job details |
| **Applications**| `/api/v1/applications/` | `GET / POST` | Submit or track job applications |
| **Applications**| `/api/v1/applications/:id/` | `PATCH` | Update application status (`Admin`/`Recruiter`) |
| **Match** | `/api/v1/recommendations/` | `GET` | Get personalized top job recommendations |
| **Alerts** | `/api/v1/notifications/` | `GET / PATCH` | Fetch notifications & mark as read |

---

## ⚡ Getting Started

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher
- **npm** or **yarn**

---

### 1️⃣ Backend Setup (Django REST Framework)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - **Windows**:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install backend dependencies**:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers celery redis pillow
   ```

4. **Apply database migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Create an administrative user (optional)**:
   ```bash
   python manage.py createsuperuser
   ```

6. **Start the backend development server**:
   ```bash
   python manage.py runserver 8000
   ```
   The backend API will run at `http://localhost:8000/`.

---

### 2️⃣ Frontend Setup (React + Vite)

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:3000/`.

> **Note**: Vite is preconfigured to proxy `/api` and `/media` requests to the Django backend running at `http://localhost:8000`.

---

## ⚙️ Environment & Configuration

Backend settings are configured in `backend/config/settings/base.py`. key variables can be customized via environment variables:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `SECRET_KEY` | `django-insecure-...` | Secret key for Django cryptographic signing |
| `DEBUG` | `True` | Debug mode for development |
| `REDIS_URL` | `redis://localhost:6379/0` | Connection string for Celery & Redis cache |
| `NOTIFICATION_THRESHOLD` | `70.0` | Minimum score percentage required for recommendation notifications |

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
