# Data Flow Documentation: Frontend to PostgreSQL

This document explains how data flows through the Employee Self-Service Portal application, from the React frontend to the PostgreSQL database.

## Architecture Overview

The application follows a layered architecture pattern:

```
Frontend (React/TypeScript)
    ↓ HTTP Requests
API Endpoints (FastAPI)
    ↓ Dependency Injection
Services (Business Logic)
    ↓ Repository Pattern
Repositories (SQLAlchemy ORM)
    ↓ SQL Queries
PostgreSQL Database
```

## Complete Data Flow Example

### Example: User Enrolling in a Course

Let's trace a complete flow when a user enrolls in a course:

#### 1. Frontend Layer (`frontend/src/api/learning.ts`)

```typescript
// User clicks "Enroll" button in UI
enrollInCourse: async (courseId: number, autoEnrolled: boolean = false) => {
  const response = await apiClient.post(
    `/learning/courses/${courseId}/enroll?auto_enrolled=${autoEnrolled}`
  );
  return response.data;
}
```

**What happens:**
- Frontend makes HTTP POST request to `/api/learning/courses/{courseId}/enroll`
- Request includes authentication token (JWT) in headers
- Query parameter `auto_enrolled` indicates if enrollment was AI-suggested

#### 2. API Router Layer (`backend/app/learning/router.py`)

```python
@router.post("/courses/{course_id}/enroll", response_model=EnrollmentResponse)
def enroll_in_course(
    course_id: int,
    auto_enrolled: bool = False,
    current_user: User = Depends(get_current_user),  # Authentication
    db: Session = Depends(get_db)                     # Database session
):
    service = LearningService(db)
    enrollment = service.enroll_user(current_user.id, course_id, auto_enrolled=auto_enrolled)
    if not enrollment:
        raise HTTPException(status_code=400, detail="Failed to enroll")
    return enrollment
```

**What happens:**
- FastAPI router receives HTTP request
- `get_current_user` dependency validates JWT token and returns authenticated user
- `get_db` dependency creates SQLAlchemy database session
- Router instantiates service with database session
- Service method is called with user ID, course ID, and auto_enrolled flag
- Response is serialized using Pydantic schema (`EnrollmentResponse`)

#### 3. Service Layer (`backend/app/learning/service.py`)

```python
def enroll_user(self, user_id: int, course_id: int, auto_enrolled: bool = False) -> Optional[Enrollment]:
    """Enroll user in course"""
    # Check if already enrolled
    existing = self.enrollment_repo.get_by_user_and_course(user_id, course_id)
    if existing:
        return existing

    enrollment = Enrollment(
        user_id=user_id,
        course_id=course_id,
        status=EnrollmentStatus.ENROLLED,
        progress_state=ProgressState.NOT_STARTED,
        auto_enrolled=auto_enrolled
    )
    return self.enrollment_repo.create(enrollment)
```

**What happens:**
- Service contains business logic (check for duplicate enrollment)
- Creates SQLAlchemy model instance (`Enrollment`)
- Calls repository method to persist data
- Returns model instance (which will be serialized to JSON)

#### 4. Repository Layer (`backend/repositories/learning_repository.py`)

```python
class EnrollmentRepository(BaseRepository[Enrollment]):
    def __init__(self, db: Session):
        super().__init__(Enrollment, db)

    def create(self, obj: Enrollment) -> Enrollment:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj
```

**What happens:**
- Repository handles database operations
- `db.add()` adds object to SQLAlchemy session
- `db.commit()` executes INSERT SQL statement to PostgreSQL
- `db.refresh()` reloads object from database (to get auto-generated ID)
- Returns persisted model instance

#### 5. Database Layer (PostgreSQL)

**SQL Query Executed:**
```sql
INSERT INTO enrollments (user_id, course_id, status, progress_state, auto_enrolled, enrolled_at)
VALUES (1, 5, 'ENROLLED', 'NOT_STARTED', false, NOW())
RETURNING *;
```

**What happens:**
- PostgreSQL executes INSERT statement
- Data is persisted to disk
- Auto-generated fields (id, enrolled_at) are populated
- Transaction is committed

#### 6. Response Flow (Back to Frontend)

The response flows back through the same layers:

1. **Repository** returns `Enrollment` model instance
2. **Service** returns `Enrollment` model instance
3. **Router** serializes using `EnrollmentResponse` Pydantic schema
4. **FastAPI** converts to JSON and sends HTTP 200 response
5. **Frontend** receives JSON, updates UI state

## Data Flow Patterns

### Pattern 1: Read Operations (GET)

**Example: Fetching Course List**

```
Frontend: GET /api/learning/courses
    ↓
Router: @router.get("/courses")
    ↓
Service: get_courses()
    ↓
Repository: course_repo.get_all()
    ↓
SQLAlchemy: db.query(Course).all()
    ↓
PostgreSQL: SELECT * FROM courses;
    ↓
Response: JSON array of courses
```

**Files Involved:**
- `frontend/src/api/learning.ts` → `getCourses()`
- `backend/app/learning/router.py` → `get_courses()`
- `backend/app/learning/service.py` → `get_courses()`
- `backend/repositories/learning_repository.py` → `CourseRepository.get_all()`
- `backend/models/learning.py` → `Course` model
- PostgreSQL `courses` table

### Pattern 2: Create Operations (POST)

**Example: Creating a Course (Admin)**

```
Frontend: POST /api/admin/courses
    ↓
Router: @router.post("/courses")
    ↓
Service: create_course()
    ↓
Repository: course_repo.create()
    ↓
SQLAlchemy: db.add(course); db.commit()
    ↓
PostgreSQL: INSERT INTO courses (...)
    ↓
Response: Created course JSON
```

**Files Involved:**
- `frontend/src/api/admin.ts` → `createCourse()`
- `backend/app/admin/router.py` → `create_course()`
- `backend/app/admin/service.py` → `create_course()`
- `backend/repositories/learning_repository.py` → `CourseRepository.create()`
- PostgreSQL `courses` table

### Pattern 3: Update Operations (PUT)

**Example: Updating Enrollment Progress**

```
Frontend: PUT /api/learning/enrollments/{id}/progress
    ↓
Router: @router.put("/enrollments/{enrollment_id}/progress")
    ↓
Service: update_progress()
    ↓
Repository: enrollment_repo.update_progress()
    ↓
SQLAlchemy: enrollment.progress_state = new_state; db.commit()
    ↓
PostgreSQL: UPDATE enrollments SET progress_state = '...'
    ↓
Response: Updated enrollment JSON
```

### Pattern 4: Delete Operations (DELETE)

**Example: Deleting an Enrollment**

```
Frontend: DELETE /api/learning/enrollments/{id}
    ↓
Router: @router.delete("/enrollments/{enrollment_id}")
    ↓
Service: delete_enrollment()
    ↓
Repository: enrollment_repo.delete()
    ↓
SQLAlchemy: db.delete(enrollment); db.commit()
    ↓
PostgreSQL: DELETE FROM enrollments WHERE id = ...
    ↓
Response: HTTP 204 No Content
```

## Database Session Management

### Session Lifecycle

Database sessions are managed through FastAPI's dependency injection:

```python
# backend/app/database.py
def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db  # Session is available during request
    finally:
        db.close()  # Session is closed after request
```

**How it works:**
1. FastAPI calls `get_db()` when route needs database
2. Session is created from connection pool
3. Session is used throughout request handling
4. Session is automatically closed after response is sent
5. Connection is returned to pool

### Transaction Management

- **Automatic**: Each request gets its own transaction
- **Commit**: Happens in repository `create()`, `update()`, `delete()` methods
- **Rollback**: Happens automatically on exceptions
- **Isolation**: Default PostgreSQL isolation level (READ COMMITTED)

## Data Persistence

### Where Data is Stored

**All application data is stored in PostgreSQL**, including:

- **User Data**: `users`, `employees` tables
- **Learning Data**: `courses`, `enrollments`, `certificates`, `skills` tables
- **Career Data**: `goals`, `career_profiles`, `appraisals`, `feedbacks` tables
- **Wellness Data**: `initiatives`, `sessions` tables
- **Compliance Data**: `policies`, `faqs`, `compliance_documents`, `reminders` tables
- **Dashboard Data**: `user_widgets` table

### Data Persistence Guarantees

1. **Durability**: Data written to PostgreSQL is persisted to disk
2. **Consistency**: SQLAlchemy ensures data integrity through constraints
3. **Isolation**: Transactions prevent concurrent access issues
4. **Atomicity**: All-or-nothing operations (commit or rollback)

## Key Components

### Models (`backend/models/`)

SQLAlchemy ORM models define database schema:

```python
class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    # ... other fields
```

**Purpose:**
- Define table structure
- Map Python objects to database rows
- Define relationships between tables

### Repositories (`backend/repositories/`)

Data access layer using repository pattern:

```python
class CourseRepository(BaseRepository[Course]):
    def get_all(self) -> List[Course]:
        return self.db.query(Course).all()
```

**Purpose:**
- Encapsulate database queries
- Provide reusable data access methods
- Abstract SQLAlchemy details from services

### Services (`backend/app/*/service.py`)

Business logic layer:

```python
class LearningService:
    def enroll_user(self, user_id: int, course_id: int):
        # Business logic here
        return self.enrollment_repo.create(enrollment)
```

**Purpose:**
- Implement business rules
- Coordinate between repositories
- Handle complex operations

### Routers (`backend/app/*/router.py`)

API endpoint definitions:

```python
@router.post("/courses/{course_id}/enroll")
def enroll_in_course(course_id: int, db: Session = Depends(get_db)):
    service = LearningService(db)
    return service.enroll_user(...)
```

**Purpose:**
- Define HTTP endpoints
- Handle request/response serialization
- Inject dependencies (auth, database)

## Authentication Flow

### How Authentication Affects Data Flow

1. **Frontend** sends JWT token in `Authorization` header
2. **Router** uses `get_current_user` dependency
3. **Dependency** validates token and queries `users` table
4. **Service** receives authenticated `User` object
5. **Repository** uses `user.id` for data operations

**Example:**
```python
@router.get("/enrollments")
def get_enrollments(
    current_user: User = Depends(get_current_user),  # Authenticated user
    db: Session = Depends(get_db)
):
    service = LearningService(db)
    # Only returns enrollments for current_user
    return service.get_user_enrollments(current_user.id)
```

## Error Handling

### Error Flow

```
Database Error (PostgreSQL)
    ↓
SQLAlchemy Exception
    ↓
Repository catches/raises
    ↓
Service handles business logic errors
    ↓
Router catches HTTPException
    ↓
FastAPI returns HTTP error response
    ↓
Frontend handles error in catch block
```

**Example:**
```python
# Repository level
enrollment = self.enrollment_repo.get(enrollment_id)
if not enrollment:
    return None  # Not found

# Service level
if not enrollment:
    raise ValueError("Enrollment not found")

# Router level
if not enrollment:
    raise HTTPException(status_code=404, detail="Enrollment not found")
```

## Data Validation

### Validation Layers

1. **Frontend**: TypeScript types, form validation
2. **Pydantic Schemas**: Request/response validation
3. **SQLAlchemy Models**: Database constraints
4. **PostgreSQL**: Database-level constraints

**Example:**
```python
# Pydantic schema (request validation)
class ProgressUpdateRequest(BaseModel):
    progress_state: ProgressState  # Enum validation

# SQLAlchemy model (database constraint)
class Enrollment(Base):
    progress_state = Column(Enum(ProgressState), nullable=False)
```

## Summary

The data flow follows a clean, layered architecture:

1. **Frontend** makes HTTP requests with authentication
2. **Routers** receive requests and inject dependencies
3. **Services** implement business logic
4. **Repositories** execute database queries
5. **PostgreSQL** stores and retrieves data
6. **Response** flows back through layers as JSON

**Key Points:**
- All data is stored in PostgreSQL (not temporary)
- Data persists between server restarts
- Each layer has a specific responsibility
- Database sessions are managed automatically
- Transactions ensure data consistency

## Verification

To verify the data flow is working correctly:

1. **Check Database Connection:**
   ```bash
   python backend/scripts/verify_setup.py
   ```

2. **Check Data Exists:**
   ```sql
   SELECT COUNT(*) FROM courses;
   SELECT COUNT(*) FROM enrollments;
   SELECT COUNT(*) FROM users;
   ```

3. **Test API Endpoints:**
   ```bash
   curl http://localhost:8000/api/learning/courses
   ```

4. **Monitor Database Queries:**
   Enable SQLAlchemy logging to see SQL queries:
   ```python
   import logging
   logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
   ```
