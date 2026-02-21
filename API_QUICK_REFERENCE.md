# API Quick Reference Card

**Base URL:** `http://localhost:5000/api`

---

## 🔑 Authentication

```bash
# Register
POST /auth/register
{ "name": "string", "email": "string", "password": "string (min: 8)" }

# Login
POST /auth/login
{ "email": "string", "password": "string" }
→ Returns: { accessToken, refreshToken }

# Get Current User
GET /auth/me
Headers: Authorization: Bearer <accessToken>
```

---

## 📦 Projects (BUYER)

```bash
# Create Project
POST /projects
Auth: BUYER
{ "title": "string", "description": "string" }

# List All Projects
GET /projects?page=1&limit=10&status=OPEN

# Get Project Details
GET /projects/:id

# View Requests on Your Project
GET /projects/:id/requests
Auth: BUYER
```

---

## 🤝 Project Requests (SOLVER)

```bash
# Request a Project
POST /projects/:id/request
Auth: SOLVER
Body: (empty - solverId from token)

# Buyer Responds to Request
PATCH /projects/:id/respond
Auth: BUYER
{ "status": "ACCEPTED" | "REJECTED" }
```

---

## ✅ Tasks (SOLVER creates, BUYER/SOLVER view)

```bash
# Create Task (assign to project)
POST /tasks/projects/:projectId/tasks
Auth: SOLVER
{
  "title": "string (min: 3)",
  "description": "string (min: 10)",
  "deadline": "ISO 8601 datetime"
}

# List Project Tasks
GET /tasks/projects/:projectId/tasks
Auth: SOLVER/BUYER
?status=IN_PROGRESS&sortBy=deadline&order=asc

# Get Task Details
GET /tasks/tasks/:id
Auth: SOLVER/BUYER

# Update Task
PATCH /tasks/tasks/:id
Auth: SOLVER
{ "title"?: "string", "description"?: "string", "deadline"?: "datetime" }
```

---

## 📤 Submissions (SOLVER submits, BUYER reviews)

```bash
# Submit Task (Upload ZIP)
POST /submissions/tasks/:taskId/submit
Auth: SOLVER
Content-Type: multipart/form-data
Form Data: file = <File>

# Review Submission
PATCH /submissions/tasks/:taskId/review
Auth: BUYER
{ "action": "ACCEPT" | "REJECT", "comment"?: "string (max: 500)" }

# Get Submission Details
GET /submissions/tasks/:taskId/submission
Auth: SOLVER/BUYER
```

---

## 🔐 Authorization Headers

**All authenticated requests:**
```
Authorization: Bearer <accessToken>
```

---

## 📊 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK (GET/PATCH success) |
| 201 | Created (POST success) |
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 409 | Conflict (duplicate/invalid state) |
| 413 | File Too Large (>50 MB) |
| 500 | Server Error |

---

## 👥 Roles & Permissions

| Role | Can Create | Can View | Can Edit | Can Review |
|------|-----------|----------|----------|-----------|
| **BUYER** | Projects | Requests, Submissions | - | Tasks (review) |
| **SOLVER** | Tasks, Requests | Projects, Tasks | Tasks | Submissions |
| **ADMIN** | Everything | Everything | Everything | Everything |

---

## 🔄 Typical User Flows

### Buyer Flow
1. **Register/Login** → POST /auth/register or /auth/login
2. **Create Project** → POST /projects
3. **View Requests** → GET /projects/:id/requests
4. **Accept/Reject** → PATCH /projects/:id/respond
5. **View Tasks** → GET /tasks/projects/:projectId/tasks
6. **Review Submission** → PATCH /submissions/tasks/:taskId/review

### Solver Flow
1. **Register/Login** → POST /auth/register or /auth/login
2. **Browse Projects** → GET /projects
3. **Request Project** → POST /projects/:id/request
4. **Create Tasks** → POST /tasks/projects/:projectId/tasks
5. **Submit Work** → POST /submissions/tasks/:taskId/submit
6. **View Feedback** → GET /submissions/tasks/:taskId/submission

---

## 🌐 Request Response Format

### Success
```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": { /* resource data */ },
  "pagination": { "page": 1, "limit": 10, "total": 50 }
}
```

### Error
```json
{
  "statusCode": 400,
  "message": "Error message",
  "details": { "field": "error_details" }
}
```

---

## 🛠️ Common Implementations

### React Hook for API Call
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const apiCall = async (endpoint, options = {}) => {
  setLoading(true);
  try {
    const response = await fetch(`http://localhost:5000/api${endpoint}`, {
      headers: { Authorization: `Bearer ${token}`, ...options.headers },
      ...options,
    });
    const data = await response.json();
    return data;
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Handle Token Expiration
```typescript
if (response.status === 401) {
  // Token expired
  const newToken = await refreshAccessToken(refreshToken);
  localStorage.setItem('accessToken', newToken);
  // Retry original request with new token
}
```

### Upload File
```typescript
const formData = new FormData();
formData.append('file', file);
await fetch(`/api/submissions/tasks/${taskId}/submit`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

---

## 📋 Complete Endpoint List

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | /auth/register | ❌ | - |
| POST | /auth/login | ❌ | - |
| GET | /auth/me | ✅ | Any |
| POST | /projects | ✅ | BUYER |
| GET | /projects | ❌ | - |
| GET | /projects/:id | ❌ | - |
| POST | /projects/:id/request | ✅ | SOLVER |
| PATCH | /projects/:id/respond | ✅ | BUYER |
| GET | /projects/:id/requests | ✅ | BUYER |
| POST | /tasks/projects/:projectId/tasks | ✅ | SOLVER |
| GET | /tasks/projects/:projectId/tasks | ✅ | BUYER/SOLVER |
| GET | /tasks/tasks/:id | ✅ | BUYER/SOLVER |
| PATCH | /tasks/tasks/:id | ✅ | SOLVER |
| POST | /submissions/tasks/:taskId/submit | ✅ | SOLVER |
| PATCH | /submissions/tasks/:taskId/review | ✅ | BUYER |
| GET | /submissions/tasks/:taskId/submission | ✅ | BUYER/SOLVER |

---

## 🔗 Resources

- **Full API Docs:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **JSON Spec:** [api-specification.json](./api-specification.json)
- **TypeScript Types:** [src/types/api.ts](./src/types/api.ts)
- **Integration Guide:** [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)

---

**Version:** 1.0.0 | **Updated:** February 21, 2026
