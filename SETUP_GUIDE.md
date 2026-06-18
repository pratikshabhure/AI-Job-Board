# 🚀 AI Job Board - Complete Setup Guide

## ✅ Project Analysis

### Project Structure
- **Backend:** FastAPI (Python) with SQLAlchemy ORM
- **Frontend:** React 18 + Vite with Tailwind CSS
- **Database:** SQLite (can be upgraded to PostgreSQL)
- **AI Engine:** Groq LLM API for candidate matching

### Tech Stack Summary
| Component | Technology | Version |
|-----------|-----------|---------|
| Backend Framework | FastAPI | 0.104.1 |
| Server | Uvicorn | 0.24.0 |
| ORM | SQLAlchemy | 2.0.23 |
| Frontend | React | 18.2.0 |
| Build Tool | Vite | 4.5.0 |
| Styling | Tailwind CSS | 3.3.5 |
| Database | SQLite | - |
| LLM API | Groq | 0.4.1 |

---

## 🔧 Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **npm or pnpm** (package manager)
- **Groq API Key** (free tier available at https://console.groq.com)

---

## 📝 Environment Setup

### Step 1: Backend Environment (.env)

A `.env` file has been created in the backend directory. **Update the following:**

```bash
# ⚠️ REQUIRED - Get from https://console.groq.com
GROQ_API_KEY=gsk_YOUR_ACTUAL_API_KEY_HERE
```

**Optional configurations:**
- `DATABASE_URL`: Change if using PostgreSQL or another database
- `JWT_SECRET_KEY`: Change to a strong random key in production
- `ALLOWED_ORIGINS`: Add your production frontend URL
- `FRONTEND_URL`: Update based on your deployment

### Step 2: Generate Secure JWT Secret (Optional but Recommended)

```bash
# Windows PowerShell
python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))"

# Linux/Mac
python3 -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))"
```

Copy the output and update `JWT_SECRET_KEY` in `.env`.

---

## 🏗️ Installation & Setup

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python run.py
```

Server will be available at: **http://localhost:8000**
API documentation: **http://localhost:8000/docs** (Swagger UI)

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

Frontend will be available at: **http://localhost:5173**

---

## 👥 Demo Credentials

### Admin Account (Company)
- **Email:** `admin@aijobboard.com`
- **Password:** `Admin@123!`
- **Access:** Job management, application pipeline, analytics

### Candidate Account (Pre-seeded)
- The database auto-seeds demo candidates on first run
- Log in or sign up to test candidate features
- Try AI matching with descriptions like: "I'm looking for a React developer role in San Francisco with 3+ years experience"

---

## 🗄️ Database

### SQLite (Default)
- **Location:** `backend/job_board.db`
- **Auto-created** on first run
- **Auto-seeded** with demo data

### Upgrade to PostgreSQL (Production)

Update `.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/ai_job_board
```

Then install:
```bash
pip install psycopg2-binary
```

---

## 🧠 Groq AI Integration

### Getting Your API Key

1. Go to https://console.groq.com
2. Sign up (free tier available)
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste into `.env` as `GROQ_API_KEY`

### Supported Models

```
- llama-3.1-8b-instant (default - fastest)
- llama-3.1-70b-versatile (more powerful)
- mixtral-8x7b-32768
- gemma-7b-it
```

### Fallback Mode

If Groq API is unavailable or offline, the app automatically switches to **deterministic rule-based matching** without requiring API calls.

---

## 🌐 CORS Configuration

Default allowed origins:
- `http://localhost:5173` (Frontend)
- `http://localhost:3000` (Alternative)

### For Production Deployment

Update `.env`:
```
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## 🚀 Running Both Services

### Option 1: Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Using Task Runner (VS Code)

Create `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Run Backend",
      "command": "python",
      "args": ["run.py"],
      "cwd": "${workspaceFolder}/backend",
      "isBackground": true,
      "group": "build"
    },
    {
      "label": "Run Frontend",
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "${workspaceFolder}/frontend",
      "isBackground": true,
      "group": "build"
    }
  ]
}
```

---

## ✨ Key Features to Try

### 👤 Candidate Features
1. **Sign Up / Login:** Create candidate profile
2. **Update Profile:** Add skills, domain, location, experience
3. **Browse Jobs:** View all available job listings
4. **AI Matching:** Describe your ideal job, get compatibility scores
5. **Track Applications:** Monitor application status (Applied → Shortlisted → Rejected)

### 🏢 Admin Features
1. **Login:** Use admin credentials
2. **Create Jobs:** Add new job listings
3. **Manage Applications:** Review and action candidate applications
4. **Analytics Dashboard:** View charts and statistics
5. **Shortlist/Reject:** Dynamic workflow management

---

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Logout

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/{id}` - Get job details
- `POST /api/jobs` - Create job (Admin only)
- `PUT /api/jobs/{id}` - Update job (Admin only)

### Candidates
- `GET /api/candidates/{id}` - Get candidate profile
- `PUT /api/candidates/{id}` - Update profile

### Applications
- `GET /api/applications` - List applications
- `POST /api/applications` - Apply for job
- `PUT /api/applications/{id}/status` - Update application status

### AI Matching
- `POST /api/ai-match` - Get AI-powered job matches

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard analytics
- `GET /api/dashboard/candidate` - Candidate dashboard

---

## 🐛 Troubleshooting

### Backend Issues

**Issue: "ModuleNotFoundError"**
```bash
# Ensure virtual environment is activated
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

**Issue: "Address already in use :8000"**
```bash
# Kill the process using port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
kill -9 <PID>
```

**Issue: Groq API Key error**
- Verify API key is correct in `.env`
- Check Groq account has active API credits
- Test with curl: `curl -H "Authorization: Bearer YOUR_KEY" https://api.groq.com/openai/v1/models`

### Frontend Issues

**Issue: Port 5173 already in use**
```bash
# Vite will automatically try 5174, 5175, etc.
# Or explicitly set: npm run dev -- --port 3001
```

**Issue: CORS errors**
- Ensure backend is running on http://localhost:8000
- Check `ALLOWED_ORIGINS` in backend `.env`
- Frontend should be on http://localhost:5173

---

## 📦 Deployment

### Render (Recommended for beginners)
See `README.md` for detailed Render deployment guide.

### Manual Deployment
1. **Backend:** Deploy FastAPI to any Python host (Heroku, AWS, Azure, etc.)
2. **Frontend:** Build and deploy to static hosting (Netlify, Vercel, AWS S3, etc.)
3. **Database:** Upgrade to PostgreSQL for production
4. **Environment:** Update all `.env` variables for production URLs and keys

---

## 📚 Additional Resources

- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **React Docs:** https://react.dev/
- **Groq Docs:** https://groq.com/docs/
- **SQLAlchemy:** https://docs.sqlalchemy.org/
- **Tailwind CSS:** https://tailwindcss.com/

---

## ✅ Verification Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] `.env` file created with Groq API key
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend runs without errors (`python run.py`)
- [ ] Frontend runs without errors (`npm run dev`)
- [ ] Can access http://localhost:8000/docs
- [ ] Can access http://localhost:5173
- [ ] Can login with admin credentials
- [ ] AI matching works with Groq API key

---

## 🎉 You're All Set!

Your AI Job Board is ready to use. Start with the setup steps above, and refer back to this guide if you encounter any issues.

For questions or contributions, check the README.md and project documentation.

Happy coding! 🚀
