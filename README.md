# AssignmentHub — College Assignment Management System

> **PRMCEAM Software Engineering Assessment (Project B2: Basic Assignment Submission)**  
> A full-stack web application designed for academic coursework management, supporting professors in publishing assignments and tracking student submissions with automated, server-authoritative deadline validation.

---

## 1. Project Title
**AssignmentHub** — College Assignment Management System

## 2. Project Description
AssignmentHub is an assignment management platform built with React, Node.js, Express, MongoDB, and Mongoose. The platform bridges the gap between course instructors and students by providing role-specific dashboards, authenticated portals, and deadline enforcement. 

Rather than relying on client-side timestamps that can be modified or manipulated, AssignmentHub calculates submission timeliness (`On Time` vs. `Late`) directly on the server at the exact millisecond the request is processed, adhering to academic integrity standards.

---

## 3. Key Features
- **Role-Based Authentication**: Dedicated registration and login workflows for **Admin / Professor** and **Student** accounts, protected by bcryptjs password hashing and JWT tokens.
- **Admin Assignment Management**: Professors can create assignments with title, description, and strict submission deadlines, and monitor student submission counts.
- **Student Submission Portal**: Students can view active and past assignments and submit their work either as a repository/project link, formatted text write-up, or both.
- **Server-Authoritative Timeliness**: Automatic server-side evaluation comparing submission timestamp with the assignment deadline. Exact deadline timestamp matches are marked **On Time** (`submittedAt <= deadline`).
- **One Submission Per Assignment**: Strict database constraint preventing multiple submissions for the same assignment by the same student.
- **Admin Submission Auditing**: Instructors can inspect student details, submitted links, textual responses, timestamps, and timeliness status for their assignments.
- **Clean Light Theme UI**: Professional, modern, and accessible design system optimized for academic evaluation without visual clutter or dark mode.

---

## 4. User Roles & Permissions

There are exactly **two** distinct user roles:

| Role | Permissions & Capabilities |
| :--- | :--- |
| **Admin / Professor** | • Register & log in to Admin Portal<br>• Create new assignments with deadlines<br>• View all assignments created by their account<br>• Inspect student submissions, timestamps, and timeliness |
| **Student** | • Register & log in to Student Portal<br>• Browse active and past assignments<br>• Submit project link or text response (1 submission allowed)<br>• Review personal submission status and timestamp |

> **Security Rule**: Students are strictly prohibited from invoking Admin endpoints (e.g. creating assignments or reviewing other students' submissions). Admins cannot submit student coursework.

---

## 5. Technology Stack & Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React.js (v19) + JavaScript | Declarative, component-driven UI library allowing modular state management. |
| **Tooling** | Vite | Lightning-fast development server and optimized ES module bundling. |
| **Routing** | React Router (v7) | Client-side routing with role-based `ProtectedRoute` guards for `/admin/*` and `/student/*`. |
| **Styling** | Tailwind CSS (Light Theme) | Utility-first CSS providing accessible, consistent typography, cards, and buttons with no dark mode clutter. |
| **Backend** | Node.js + Express.js | Asynchronous, event-driven JavaScript REST API providing modular routing and middleware pipelines. |
| **Database** | MongoDB + Mongoose | Flexible document model with schema validation, compound unique indexing, and populate queries. |
| **Authentication** | JWT (`jsonwebtoken`) + `bcryptjs` | Stateless token authorization via `Authorization: Bearer <token>` with salted 10-round bcrypt password hashing. |

---

## 6. Project Structure

```text
assignment-management-system/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Navigation header with logout & profile
│   │   │   └── ProtectedRoute.jsx      # Route guard with role-based redirection
│   │   ├── pages/
│   │   │   ├── Home.jsx                # Landing portal with quick credentials
│   │   │   ├── AdminLogin.jsx          # Professor login with autofill
│   │   │   ├── AdminRegister.jsx       # Professor registration
│   │   │   ├── AdminDashboard.jsx      # Assignment creation & submission viewer
│   │   │   ├── StudentLogin.jsx        # Student login with autofill
│   │   │   ├── StudentRegister.jsx     # Student registration
│   │   │   └── StudentDashboard.jsx    # Assignment browser & submission modal
│   │   ├── services/
│   │   │   └── api.js                  # Centralized fetch wrapper & JWT headers
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # React Context for authentication state
│   │   ├── App.jsx                     # Route declarations
│   │   ├── main.jsx                    # React DOM entry point
│   │   └── index.css                   # Global Tailwind light theme styles
│   ├── package.json                    # Client dependencies & scripts
│   └── vite.config.js                  # Vite configuration & proxy settings
│
├── server/
│   ├── config/
│   │   └── db.js                       # Mongoose connection & embedded Mongo fallback
│   ├── controllers/
│   │   ├── authController.js           # Register/login for admin & student
│   │   ├── assignmentController.js     # CRUD for coursework
│   │   └── submissionController.js     # Timeliness logic & submission audit
│   ├── middleware/
│   │   ├── authMiddleware.js           # JWT verification & user attachment
│   │   └── roleMiddleware.js           # Role-based authorization (admin / student)
│   ├── models/
│   │   ├── User.js                     # User schema with bcrypt pre-save hook
│   │   ├── Assignment.js               # Assignment schema with deadline & creator
│   │   └── Submission.js               # Submission schema with compound index
│   ├── routes/
│   │   ├── authRoutes.js               # Auth endpoints (/api/auth/*)
│   │   ├── assignmentRoutes.js         # Assignment endpoints (/api/assignments/*)
│   │   └── submissionRoutes.js         # Submission endpoints (/api/submissions/*)
│   ├── utils/
│   │   └── seedData.js                 # Automatic seed for test accounts & tasks
│   ├── server.js                       # Standalone Express REST server
│   └── package.json                    # Backend dependencies & scripts
│
├── .env.example                        # Sample environment configuration
├── .gitignore                          # Ignored artifacts & environment secrets
├── server.ts                           # Unified full-stack server for AI Studio
└── README.md                           # Documentation
```

---

## 7. Prerequisites & Requirements
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **bun**: v9.0.0 or higher
- **MongoDB**: Either a local instance (`mongodb://localhost:27017/assignmenthub`) OR a free MongoDB Atlas cluster.
  *(Note: An embedded in-memory MongoDB is automatically bundled for zero-config evaluation).*

---

## 8. Environment Variables

Create a `.env` file in the root or `server/` directory based on `.env.example`:

```env
# Backend Port
PORT=5000

# MongoDB URI (MongoDB Atlas or local)
# Replace YOUR_PASSWORD with your database user password (omit < > brackets)
MONGO_URI=mongodb+srv://deepanpinjani28_db_user:YOUR_PASSWORD@cluster0.wzcvcbp.mongodb.net/assignmenthub?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret
JWT_SECRET=assignmenthub_jwt_super_secret_key_college_assessment_2026

# Allowed Frontend URL for CORS
CLIENT_URL=http://localhost:5173

# Frontend API URL (for Vite)
VITE_API_URL=http://localhost:5000/api
```

---

## 9. How to Run Locally

### Option A: Running Frontend and Backend Separately

#### 1. Start Backend Server
```bash
cd server
npm install
npm run dev
# Server will start on http://localhost:5000
```

#### 2. Start Frontend Client (in a second terminal)
```bash
cd client
npm install
npm run dev
# Frontend will start on http://localhost:5173
```

---

### Option B: Running Unified Full-Stack (Single Command)
```bash
# From workspace root
npm install
npm run dev
# Application will start at http://localhost:3000
```

---

## 10. Pre-Configured Test Credentials

For evaluation and testing, the database automatically boots with the following accounts:

### 1. Admin / Professor Account
- **Portal**: `/admin/login`
- **Email**: `prof.turing@assignmenthub.edu`
- **Password**: `AdminPass123!`
- **Role**: `admin`
- **Capabilities**: Create assignments, view all submissions, inspect timestamps.

### 2. Student Account
- **Portal**: `/student/login`
- **Email**: `rahul.sharma@assignmenthub.edu`
- **Password**: `StudentPass123!`
- **Role**: `student`
- **Capabilities**: View assignments, submit work, view timeliness badge.

---

## 11. REST API Specification

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/admin/register` | Public | Register new administrator/professor |
| `POST` | `/api/auth/admin/login` | Public | Authenticate administrator & issue JWT |
| `POST` | `/api/auth/student/register` | Public | Register new student account |
| `POST` | `/api/auth/student/login` | Public | Authenticate student & issue JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |

### Assignment Routes (`/api/assignments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/assignments` | Admin | Create assignment (title, description, deadline) |
| `GET` | `/api/assignments` | Authenticated | Admins get created list; Students get list with status |
| `GET` | `/api/assignments/:id` | Authenticated | Get single assignment details |

### Submission Routes (`/api/submissions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/submissions` | Student | Submit assignment (link OR text) |
| `GET` | `/api/submissions/assignment/:id` | Admin | View submissions for an assignment created by admin |
| `GET` | `/api/submissions/my` | Student | Retrieve current student's submissions |

---

## 12. Critical Business Logic: Timeliness Calculation

In academic environments, client machine clocks cannot be trusted (users can adjust local system time to manipulate submission status). 

Therefore, AssignmentHub calculates timeliness exclusively on the server at execution time:

```javascript
// 1. Generate authoritative server timestamp
const serverSubmittedAt = new Date();
const deadlineDate = new Date(assignment.deadline);

// 2. Strict inequality evaluation:
// Exact timestamp matches are marked "On Time" (<= comparison)
const isDeadlineMet = serverSubmittedAt.getTime() <= deadlineDate.getTime();
const status = isDeadlineMet ? 'On Time' : 'Late';

// 3. Persist submission
const submission = await Submission.create({
  assignmentId,
  studentId: req.user._id,
  submissionLink,
  response,
  submittedAt: serverSubmittedAt,
  status,
});
```

### Edge Case Handled:
- If a submission arrives at `23:59:00.000` for a deadline of `23:59:00.000`, it evaluates to **`On Time`**.
- Any submission arriving after the deadline millisecond evaluates to **`Late`**.

---

## 13. Deployment Instructions

### Frontend (e.g., Vercel / Netlify)
1. Set Build Command: `npm run build`
2. Set Output Directory: `dist`
3. Configure `VITE_API_URL` to point to your live backend URL (e.g. `https://your-api.onrender.com/api`).

### Backend (e.g., Render / Railway / Cloud Run)
1. Set Start Command: `node server/server.js`
2. Set Environment Variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`.

---

## 14. Repository & Live Deployment Links
- **GitHub Repository**: [https://github.com/placeholder/assignment-management-system](https://github.com/placeholder/assignment-management-system)
- **Live Application Deployment**: [https://assignment-hub-live.web.app](https://assignment-hub-live.web.app)
