# AI-Powered Employee Self-Service Portal

A production-quality employee portal platform with OTP-based authentication, learning management, career growth tracking, compliance, wellness, and AI assistance.

## Features

- **OTP-Based Authentication**: Employee number login with email OTP verification
- **Learning Module**: Course catalog with Internal/External courses, event-based progress tracking, certificate upload
- **Career Growth**: Goal setting, self-appraisals, AI feedback
- **Compliance**: Policy library, FAQs, reminders
- **Wellness**: Initiatives and session booking
- **AI Assistant**: Context-aware assistance for policies, learning recommendations, and more
- **G10X Theme**: Professional red-orange gradient design

## Tech Stack

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic (migrations)
- JWT authentication
- OpenAI integration

### Frontend
- React + TypeScript
- Material-UI (MUI)
- React Router
- React Query
- Vite

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 12+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

5. Update `.env` with your database URL and other configurations:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/employee_portal
JWT_SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
EMAIL_MOCK_MODE=true
```

6. Initialize database:
```bash
# Create database
createdb employee_portal

# Run migrations
alembic upgrade head
```

7. Seed dummy employee data:
```bash
python scripts/seed_employees.py
```

This creates test employees:
- EMP001, EMP002, EMP003 (regular employees)
- ADMIN001, ADMIN002 (admin users)

8. (Optional) Verify setup:
```bash
python scripts/verify_setup.py
```

This will check:
- .env file exists
- Database connection works
- Database tables exist
- Employee data is seeded

9. Start the server:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000
```

4. (Optional) Verify setup:
```bash
node scripts/verify_setup.js
```

This will check:
- .env file exists and is configured
- node_modules are installed

5. Start development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Project Structure

```
backend/
├── app/              # FastAPI application
│   ├── auth/        # Authentication (OTP, JWT)
│   ├── learning/    # Learning module
│   ├── career/       # Career module
│   ├── compliance/  # Compliance module
│   ├── wellness/    # Wellness module
│   ├── ai/          # AI assistant
│   └── admin/       # Admin endpoints
├── models/          # SQLAlchemy models
├── repositories/    # Data access layer
├── services/        # Business logic services
└── alembic/        # Database migrations

frontend/
├── src/
│   ├── api/         # API client functions
│   ├── components/  # React components
│   ├── contexts/    # React Context providers
│   ├── hooks/       # Custom hooks
│   ├── theme/       # MUI theme configuration
│   └── types/       # TypeScript types
```

## Authentication Flow

1. User enters employee number
2. System looks up employee in company database
3. OTP is generated and sent to employee's email
4. User verifies OTP
5. If employee has admin access, role selection is shown
6. JWT token is generated and user is logged in

## Learning Module

- **Course Types**: Internal (hosted in portal) or External (LinkedIn Learning, etc.)
- **Progress Tracking**: Event-based with ENUM states (NOT_STARTED, LOW, MEDIUM, HIGH, COMPLETED)
- **Certificate Upload**: For completed courses (PDF/image)
- **External Course Flow**: After progress update, redirects to external URL

## API Endpoints

### Authentication
- `POST /auth/request-otp` - Request OTP
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/select-role` - Select role and login

### Learning
- `GET /learning/courses` - Get course catalog
- `POST /learning/courses/{id}/enroll` - Enroll in course
- `GET /learning/enrollments` - Get user enrollments
- `PUT /learning/enrollments/{id}/progress` - Update progress
- `POST /learning/enrollments/{id}/certificate` - Upload certificate

### Other modules
- Dashboard, Career, Compliance, Wellness, AI, Admin endpoints

## Development

### Running Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Environment Variables

See `.env.example` files in both backend and frontend directories for required environment variables.

## License

Proprietary - Internal use only
