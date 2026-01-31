from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.dashboard.router import router as dashboard_router
from app.learning.router import router as learning_router
from app.career.router import router as career_router
from app.compliance.router import router as compliance_router
from app.wellness.router import router as wellness_router
from app.leave.router import router as leave_router
from app.payroll.router import router as payroll_router
from app.ai.router import router as ai_router
from app.admin.router import router as admin_router

app = FastAPI(
    title="Employee Self-Service Portal API",
    description="AI-powered employee portal backend",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(learning_router, prefix="/learning", tags=["Learning"])
app.include_router(career_router, prefix="/career", tags=["Career"])
app.include_router(compliance_router, prefix="/compliance", tags=["Compliance"])
app.include_router(wellness_router, prefix="/wellness", tags=["Wellness"])
app.include_router(leave_router, prefix="/leave", tags=["Leave"])
app.include_router(payroll_router, prefix="/payroll", tags=["Payroll"])
app.include_router(ai_router, prefix="/ai", tags=["AI"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])


@app.get("/")
async def root():
    return {"message": "Employee Self-Service Portal API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
