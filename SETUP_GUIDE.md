# Quick Setup Guide

This is a condensed version of the setup process. For detailed instructions, see the plan file or README.md.

## Quick Start Checklist

### Backend Setup (Terminal 1)

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # OR
   source venv/bin/activate  # Mac/Linux
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file:**
   Create `backend/.env` with:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/employee_portal
   JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
   EMAIL_MOCK_MODE=true
   ```

5. **Create database:**
   ```bash
   createdb -U postgres employee_portal
   ```

6. **Run migrations:**
   ```bash
   alembic upgrade head
   ```

7. **Seed employees:**
   ```bash
   python scripts/seed_employees.py
   ```

8. **Verify setup (optional):**
   ```bash
   python scripts/verify_setup.py
   ```

9. **Start server:**
   ```bash
   uvicorn app.main:app --reload
   ```

Backend should be running at `http://localhost:8000`

### Frontend Setup (Terminal 2)

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   Create `frontend/.env` with:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Verify setup (optional):**
   ```bash
   node scripts/verify_setup.js
   ```

5. **Start dev server:**
   ```bash
   npm run dev
   ```

Frontend should be running at `http://localhost:5173`

## Verification Steps

1. **Backend Health:** Open `http://localhost:8000/health` - should return `{"status":"healthy"}`

2. **Frontend Loads:** Open `http://localhost:5173` - should see login page

3. **Test Login:**
   - Enter employee number: `EMP001` or `ADMIN001`
   - Check backend console for OTP (since EMAIL_MOCK_MODE=true)
   - Enter OTP and login

4. **Test Pages:** Navigate through Dashboard, Learning, Career, Compliance, Wellness

## Test Employee Numbers

- `EMP001` - Regular employee
- `EMP002` - Regular employee  
- `EMP003` - Regular employee
- `ADMIN001` - Admin (can select Admin or User role)
- `ADMIN002` - Admin (can select Admin or User role)

## Troubleshooting

- **Database errors:** Check PostgreSQL is running and DATABASE_URL is correct
- **Import errors:** Make sure venv is activated and dependencies are installed
- **API errors:** Verify backend is running on port 8000
- **CORS errors:** Check CORS_ORIGINS in backend/.env includes frontend URL

## Need Help?

Run the verification scripts:
- Backend: `python backend/scripts/verify_setup.py`
- Frontend: `node frontend/scripts/verify_setup.js`

These will check your configuration and point out any issues.
