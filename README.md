DEMO VIDEO LINK: https://drive.google.com/file/d/1YZZPIOHeqnXkTr_V2DOxOXB_tPMCTSBG/view?usp=sharing&t=5.365
VERCEL LINK https://frontend-three-gamma-6oxiidj128.vercel.app/login
 
# ExamShield – Secure Question Paper Leakage Prevention and Audit System

---

## 📌 Project Title

**ExamShield – Secure Question Paper Leakage Prevention and Audit System**

---

## 📝 Brief Description

ExamShield is a full-stack web application that implements a realistic prototype of a **secure examination question-paper management system**.

The main objective is to **reduce the possibility of question-paper leakage** by:
- Minimizing exposure time through controlled release
- Restricting access using **role-based authorization** (RBAC)
- Encrypting question papers using **AES-256 symmetric encryption**
- Maintaining detailed **audit logs** for every action
- Using **blockchain-inspired SHA-256 hash verification** for tamper detection and accountability

The system supports 5 distinct roles: **Question Setter, Reviewer, Exam Controller, Auditor, and Admin**, each with their own dashboard and access rights.

---

## 🛠️ Technologies / Tools Used

### Frontend
| Technology     | Purpose                              |
|----------------|--------------------------------------|
| React.js 18    | UI component framework               |
| Vite 5         | Frontend build tool and dev server   |
| Tailwind CSS 3 | Utility-first CSS styling            |
| React Router 6 | Client-side routing                  |
| Axios          | HTTP client for API calls            |
| Lucide React   | Icon library                         |

### Backend
| Technology         | Purpose                                   |
|--------------------|-------------------------------------------|
| Java 17+           | Programming language                      |
| Spring Boot 3      | Backend framework                         |
| Spring Security    | Authentication and authorization          |
| Spring Data JPA    | Database ORM                              |
| JWT (JJWT)         | Stateless token-based authentication      |
| BCrypt             | Password hashing                          |
| AES-256            | Question paper encryption                 |
| SHA-256            | Integrity hash generation                 |
| H2 Database        | In-memory database (no setup required)    |
| Maven              | Build and dependency management           |

### Development Tools
| Tool          | Purpose              |
|---------------|----------------------|
| VS Code       | Code editor          |
| Postman       | API testing          |
| Git & GitHub  | Version control      |

---

## ⚙️ Steps to Install Dependencies and Run the Project

### Prerequisites

Make sure the following are installed on your system:

| Tool     | Version    | Check Command   |
|----------|------------|-----------------|
| Java JDK | 17 or above | `java -version` |
| Node.js  | 18 or above | `node -v`       |
| npm      | 9 or above  | `npm -v`        |
| Git      | Any         | `git --version` |

> Maven is NOT required separately — the project includes `mvnw.cmd` (Maven Wrapper).

---

### Step 1 – Clone the Repository

```bash
git clone https://github.com/<your-username>/examshield.git
cd examshield
```

---

### Step 2 – Run the Backend (Spring Boot)

Open a terminal and run:

```bash
cd backend
./mvnw.cmd spring-boot:run
```

**For Mac/Linux:**
```bash
cd backend
./mvnw spring-boot:run
```

Wait until you see:
```
Started ExamShieldApplication in X seconds
Tomcat started on port(s): 8081
```

| Resource            | URL                              |
|---------------------|----------------------------------|
| API Base URL        | http://localhost:8081/api        |
| H2 Database Console | http://localhost:8081/h2-console |
| H2 JDBC URL         | jdbc:h2:mem:examshield           |
| H2 Username         | sa                               |
| H2 Password         | (leave blank)                    |

> **Note:** The backend automatically creates all database tables and pre-loads 5 demo users on startup. No manual database setup needed.

---

### Step 3 – Run the Frontend (React + Vite)

Open a **new terminal** (keep the backend terminal open) and run:

```bash
cd frontend
npm install
npm run dev
```

Wait until you see:
```
VITE ready
Local: http://localhost:5173/
```

Open your browser and go to:
```
http://localhost:5173
```

---

### 🔑 Demo Login Credentials

All accounts are auto-created when the backend starts. On the login page, click any demo card to **auto-fill credentials**.

| Role             | Username   | Password       | Dashboard URL |
|------------------|------------|----------------|---------------|
| Question Setter  | setter     | Setter@123     | /setter       |
| Reviewer         | reviewer   | Reviewer@123   | /reviewer     |
| Exam Controller  | controller | Controller@123 | /controller   |
| Auditor          | auditor    | Auditor@123    | /auditor      |
| Admin            | admin      | Admin@123      | /admin        |

---

## 📁 Project Structure / Modules and Their Purpose

```
examshield/
│
├── backend/                                  # Spring Boot Backend
│   └── src/main/java/com/examshield/
│       ├── ExamShieldApplication.java        # Main entry point
│       │
│       ├── config/
│       │   └── DataInitializer.java          # Auto-loads demo users on startup
│       │
│       ├── controller/                       # REST API Endpoints
│       │   ├── AuthController.java           # Login & Register (/api/auth)
│       │   ├── ExamController.java           # Exam management (/api/exams)
│       │   ├── QuestionController.java       # Question CRUD (/api/questions)
│       │   ├── QuestionPaperController.java  # Paper workflow (/api/papers)
│       │   ├── BlockchainController.java     # Blockchain ops (/api/blockchain)
│       │   ├── AuditLogController.java       # Audit logs (/api/audit-logs)
│       │   ├── SecurityAlertController.java  # Alerts (/api/alerts)
│       │   └── UserController.java           # User management (/api/users)
│       │
│       ├── service/                          # Business Logic Layer
│       │   ├── ExamService.java              # Exam lifecycle management
│       │   ├── QuestionPaperService.java     # AES-256 encrypt/decrypt, SHA-256
│       │   ├── BlockchainService.java        # Hash chain verification
│       │   ├── AuditLogService.java          # Audit event recording
│       │   ├── SecurityAlertService.java     # Security alert management
│       │   └── UserService.java             # User CRUD & role management
│       │
│       ├── entity/                           # Database Models (JPA)
│       │   ├── User.java                     # System user
│       │   ├── Role.java                     # Role entity (RBAC)
│       │   ├── Examination.java              # Exam record
│       │   ├── Question.java                 # Individual question
│       │   ├── QuestionPaper.java            # Paper with status workflow
│       │   ├── BlockchainBlock.java          # Blockchain ledger block
│       │   ├── AuditLog.java                 # Audit log record
│       │   └── SecurityAlert.java            # Security alert record
│       │
│       ├── security/                         # Spring Security + JWT
│       │   ├── JwtTokenProvider.java         # Generate & validate JWT tokens
│       │   ├── JwtAuthenticationFilter.java  # Intercept requests, validate token
│       │   ├── CustomUserDetailsService.java # Load user from DB for auth
│       │   └── SecurityConfig.java           # Security rules, public/protected routes
│       │
│       ├── dto/                              # Data Transfer Objects (API payloads)
│       │   ├── LoginRequest.java
│       │   ├── JwtAuthResponse.java
│       │   ├── RegisterRequest.java
│       │   ├── ExamRequest.java
│       │   ├── QuestionDto.java
│       │   ├── UserDto.java
│       │   └── ...
│       │
│       ├── exception/                        # Custom Exceptions
│       │   ├── GlobalExceptionHandler.java
│       │   ├── ResourceNotFoundException.java
│       │   └── BadRequestException.java
│       │
│       └── repository/                       # JPA Repositories (DB queries)
│
└── frontend/                                 # React + Vite Frontend
    └── src/
        ├── main.jsx                          # React DOM entry point
        ├── App.jsx                           # Routes + Role-based guards
        │
        ├── pages/                            # Dashboard Pages
        │   ├── LoginPage.jsx                 # Login with demo account cards
        │   ├── QuestionSetterDashboard.jsx   # Create exam, add questions, submit
        │   ├── ReviewerDashboard.jsx         # Approve / reject submitted papers
        │   ├── ControllerDashboard.jsx       # Encrypt, release, verify integrity
        │   ├── AuditorDashboard.jsx          # Blockchain + audit log viewer
        │   └── AdminDashboard.jsx            # User management + alerts
        │
        ├── components/                       # Shared UI Components
        │   ├── Navbar.jsx                    # Top navigation with role switcher
        │   ├── WorkflowTimeline.jsx          # Visual paper status timeline
        │   ├── ControlledIsolationCard.jsx   # Paper isolation status card
        │   └── SecurityAlertBanner.jsx       # Active alerts banner
        │
        ├── context/
        │   └── AuthContext.jsx               # Global auth state (JWT storage)
        │
        └── services/
            └── api.js                        # Axios API service with JWT interceptor
```

---

## 🖥️ Sample Input and Output

### 1. User Login

**Input (POST /api/auth/login):**
```json
{
  "username": "setter",
  "password": "Setter@123"
}
```

**Output:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "setter",
  "fullName": "Dr. Alan Turing",
  "roles": ["ROLE_QUESTION_SETTER"]
}
```

---

### 2. Create an Examination

**Input (POST /api/exams) — with Bearer Token:**
```json
{
  "title": "Advanced Computer Networks – Final Exam",
  "subject": "Computer Networks",
  "department": "Computer Engineering",
  "examDate": "2026-11-15",
  "totalMarks": 100,
  "duration": 180
}
```

**Output:**
```json
{
  "id": 1,
  "title": "Advanced Computer Networks – Final Exam",
  "subject": "Computer Networks",
  "status": "DRAFT",
  "createdAt": "2026-09-15T10:00:00"
}
```

---

### 3. Finalize Paper (AES-256 Encryption)

**Input (POST /api/papers/1/finalize):**
```
Authorization: Bearer <JWT Token>
```

**Output:**
```json
{
  "paperId": 1,
  "status": "FINALIZED",
  "encrypted": true,
  "sha256Hash": "a3f8c2d4e1b7090abc234def5678...",
  "message": "Paper finalized and encrypted with AES-256 successfully"
}
```

---

### 4. Blockchain Integrity Verification

**Input (GET /api/blockchain/verify):**
```
Authorization: Bearer <JWT Token>
```

**Output (Chain Valid):**
```json
{
  "valid": true,
  "totalBlocks": 5,
  "message": "Blockchain integrity verified – all blocks are valid"
}
```

**Output (After Tamper Demo):**
```json
{
  "valid": false,
  "invalidBlock": 1,
  "message": "Blockchain verification FAILED – tampering detected at block #1"
}
```

---

### 5. Audit Log Entry (Sample)

```json
{
  "id": 12,
  "username": "setter",
  "action": "PAPER_SUBMITTED",
  "entityType": "QuestionPaper",
  "entityId": 1,
  "details": "Question paper submitted for review",
  "timestamp": "2026-09-15T10:30:00",
  "ipAddress": "127.0.0.1",
  "status": "SUCCESS"
}
```

---

## 🚀 Quick Start Summary

```bash
# Terminal 1 – Backend
cd backend
./mvnw.cmd spring-boot:run

# Terminal 2 – Frontend
cd frontend
npm install && npm run dev

# Browser
open http://localhost:5173
# Login: setter / Setter@123
```

---

## 👨‍💻 Developer Notes

- The H2 in-memory database **resets on every backend restart** — all data is freshly seeded from `DataInitializer.java`.
- JWT tokens expire after **24 hours** by default.
- AES key and JWT secret are configured in `backend/src/main/resources/application.properties`.
- For production deployment, replace H2 with MySQL/PostgreSQL and set environment variables for secrets.

---

*ExamShield – Protecting exam integrity through technology* 🛡️
