# 🧪 TestFlow — MERN Test Case Management

A full-stack test case management system built with MongoDB, Express, React, and Node.js.

## Features

- ✅ Hierarchical organization: Project → Suite → Test Case
- ✅ Role-based access control (Admin / Manager / Tester)
- ✅ Import test cases from CSV or XLSX
- ✅ Export test cases to XLSX
- ✅ Test execution tracking (Pass / Fail / Skip / Blocked)
- ✅ Dashboard analytics with charts
- ✅ Multi-step test case editor with test steps
- ✅ JWT authentication

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 2. Setup Environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your MONGODB_URI and JWT_SECRET
```

### 3. Install Dependencies

```bash
npm run install:all
```

### 4. Start Development

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

- **API:** http://localhost:5000
- **App:** http://localhost:5173

---

## Project Structure

```
testflow/
├── server/
│   ├── models/          # Mongoose models (User, Project, TestSuite, TestCase, TestRun)
│   ├── routes/          # Express routes
│   ├── middleware/       # JWT auth + RBAC
│   └── utils/           # Token generation, CSV/XLSX parser
├── client/
│   └── src/
│       ├── pages/       # Dashboard, Projects, TestCaseEditor, ImportPage, TestRunPage, UsersPage
│       ├── store/       # Redux Toolkit slices
│       ├── components/  # Layout, Sidebar, Header
│       └── api/         # Axios instance
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/suites?projectId=` | List suites |
| POST | `/api/suites` | Create suite |
| GET | `/api/testcases?projectId=&suiteId=` | List test cases |
| POST | `/api/testcases` | Create test case |
| GET | `/api/testcases/export/xlsx?projectId=` | Export to XLSX |
| POST | `/api/import/preview` | Preview import file |
| POST | `/api/import/commit` | Commit import |
| GET | `/api/runs?projectId=` | List test runs |
| POST | `/api/runs` | Create test run |
| PUT | `/api/runs/:id/results/:tcId` | Update test result |
| GET | `/api/dashboard/stats` | Dashboard analytics |
| GET | `/api/users` | List users (Admin) |

---

## Import File Format

Your CSV/XLSX import file should have these columns:

| Column | Required | Notes |
|--------|----------|-------|
| Title | ✅ | Test case name |
| Description | ❌ | |
| Preconditions | ❌ | |
| Steps | ❌ | Newline or pipe-separated |
| Expected Result | ❌ | |
| Priority | ❌ | low / medium / high / critical |
| Type | ❌ | functional / regression / smoke / etc. |
| Tags | ❌ | Comma-separated |

---

## RBAC Roles

| Action | Admin | Manager | Tester |
|--------|-------|---------|--------|
| Manage users | ✅ | ❌ | ❌ |
| Create/delete projects | ✅ | ✅ | ❌ |
| Manage test suites | ✅ | ✅ | ❌ |
| Create/edit test cases | ✅ | ✅ | ✅ |
| Import test cases | ✅ | ✅ | ✅ |
| Export test cases | ✅ | ✅ | ✅ |
| Execute test runs | ✅ | ✅ | ✅ |
| Delete test cases | ✅ | ✅ | ❌ |

---

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/testflow
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```
