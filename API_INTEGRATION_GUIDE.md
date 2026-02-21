# 📚 Backend Marketplace API Documentation

## 📋 Overview

This directory contains comprehensive API documentation for the Backend Marketplace project. These documents are designed to help frontend developers integrate with the API efficiently.

### 📁 Documentation Files

1. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Main human-readable API reference
   - Detailed endpoint descriptions
   - Request/response examples
   - Error handling guide
   - Authentication flow

2. **[api-specification.json](./api-specification.json)** - Machine-readable API spec (JSON)
   - Structured endpoint data
   - Schema definitions
   - Status codes and error cases
   - Role-based access control definitions

3. **[src/types/api.ts](./src/types/api.ts)** - TypeScript type definitions
   - Request/response interfaces
   - Type-safe API integration
   - Enums for all statuses and roles

## 🚀 Quick Start

### Base URL
```
Development:   http://localhost:5000/api
Production:    https://your-domain.com/api
```

### Authentication
All authenticated endpoints require:
```
Authorization: Bearer <accessToken>
```

### Register → Login → Access
```bash
# 1. Register a new user
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

# 2. Login to get tokens
POST /auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

# 3. Use accessToken for authenticated requests
GET /auth/me
Header: Authorization: Bearer <accessToken>
```

## 🔑 Key Concepts

### User Roles

| Role | Capabilities |
|------|-------------|
| **BUYER** | Create projects, view requests, review submissions, manage tasks |
| **SOLVER** | Request projects, create tasks, submit solutions, view submissions |
| **ADMIN** | Full system access to all resources |

### Project Workflow

```
1. BUYER creates a PROJECT (status: OPEN)
   ↓
2. SOLVER requests the PROJECT
   ↓
3. BUYER accepts/rejects the request (status: ASSIGNED if accepted)
   ↓
4. SOLVER creates TASKS for the project
   ↓
5. SOLVER submits SUBMISSIONS (status: SUBMITTED)
   ↓
6. BUYER reviews and accepts/rejects SUBMISSION
   ↓
7. TASK marked COMPLETED (or reverted to IN_PROGRESS if rejected)
```

### Status Workflows

**Project Statuses:**
- `OPEN` → Project available for requests
- `ASSIGNED` → Solver assigned, tasks can be created
- `IN_PROGRESS` → At least one task is in progress
- `COMPLETED` → All tasks completed and approved

**Task Statuses:**
- `IN_PROGRESS` → Task created, solver is working
- `SUBMITTED` → Solver submitted the work
- `COMPLETED` → Buyer approved the submission

**Request Statuses:**
- `PENDING` → Waiting for buyer response
- `ACCEPTED` → Buyer accepted, project assigned to solver
- `REJECTED` → Buyer rejected this solver's request

## 📡 API Endpoints Summary

### Authentication (Public)
- `POST /auth/register` - Create account
- `POST /auth/login` - Login and get tokens
- `GET /auth/me` - Get current user (auth required)

### Projects
- `POST /projects` - Create project (BUYER)
- `GET /projects` - List all projects (public)
- `GET /projects/:id` - Get project details (public)

### Requests
- `POST /projects/:id/request` - Request project (SOLVER)
- `PATCH /projects/:id/respond` - Respond to request (BUYER)
- `GET /projects/:id/requests` - View project requests (BUYER)

### Tasks
- `POST /tasks/projects/:projectId/tasks` - Create task (SOLVER)
- `GET /tasks/projects/:projectId/tasks` - List project tasks (BUYER/SOLVER)
- `GET /tasks/tasks/:id` - Get task details (BUYER/SOLVER)
- `PATCH /tasks/tasks/:id` - Update task (SOLVER)

### Submissions
- `POST /submissions/tasks/:taskId/submit` - Submit task (SOLVER)
- `PATCH /submissions/tasks/:taskId/review` - Review submission (BUYER)
- `GET /submissions/tasks/:taskId/submission` - Get submission details

## 🔐 Security

### Token Management
- **accessToken**: Short-lived (expires in 15 minutes typically)
- **refreshToken**: Long-lived (expires in 7 days typically)
- Store tokens securely (not in localStorage if possible)
- Include accessToken in all authenticated requests

### Best Practices
1. Never expose tokens in URLs or logs
2. Use HTTPS only in production
3. Implement token refresh logic before expiration
4. Clear tokens on logout
5. Validate user roles before showing UI

## 🎯 Common Integration Patterns

### JavaScript/TypeScript Frontend

```typescript
import { ApiResponse, Project, CreateProjectRequest } from './src/types/api';

// Create project
const createProject = async (data: CreateProjectRequest) => {
  const response = await fetch('http://localhost:5000/api/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  const result: ApiResponse<Project> = await response.json();
  return result.data;
};

// List projects with pagination
const getProjects = async (page = 1, limit = 10) => {
  const response = await fetch(
    `http://localhost:5000/api/projects?page=${page}&limit=${limit}`
  );
  return response.json();
};

// Upload submission
const submitTask = async (taskId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(
    `http://localhost:5000/api/submissions/tasks/${taskId}/submit`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body: formData,
    }
  );
  
  return response.json();
};
```

### React Example (with Hooks)

```typescript
import { useState, useEffect } from 'react';
import { Project, ApiResponse } from './src/types/api';

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/projects');
        const result: ApiResponse<Project[]> = await response.json();
        
        if (result.statusCode === 200 && result.data) {
          setProjects(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>
          <h2>{project.title}</h2>
          <p>{project.description}</p>
          <span>Status: {project.status}</span>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
```

## 📊 Response Format

### Success Response (200/201)
```json
{
  "statusCode": 200,
  "message": "Operation successful",
  "data": { /* endpoint-specific data */ },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

### Error Response (4xx/5xx)
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "details": {
    "email": "Invalid email format",
    "password": "Password too short"
  }
}
```

## 🐛 Error Handling

### Common HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Use returned data |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Check input validation errors in `details` |
| 401 | Unauthorized | Token expired/missing, redirect to login |
| 403 | Forbidden | User lacks required role or permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry or invalid state transition |
| 413 | Payload Too Large | File exceeds size limit (max 50 MB) |
| 500 | Server Error | Try again later, contact support |

### Prisma Error Codes

| Code | Meaning | Cause |
|------|---------|-------|
| P2001 | Not found | Record doesn't exist |
| P2002 | Unique constraint | Duplicate email or request |
| P2025 | Record to update not found | Trying to update deleted record |
| P2028 | Transaction timeout | DB connection pool exhausted |

## 🔄 File Upload & Multipart

### Submit Task (ZIP File)

```typescript
const file = new File(['...'], 'submission.zip', { type: 'application/zip' });
const formData = new FormData();
formData.append('file', file);

const response = await fetch(
  'http://localhost:5000/api/submissions/tasks/{taskId}/submit',
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData, // Don't set Content-Type, browser sets it
  }
);
```

**Constraints:**
- Maximum file size: 50 MB
- Accepted formats: ZIP archives
- Required header: `Authorization: Bearer <token>`

## 📝 Pagination

Most list endpoints support pagination:

```
GET /projects?page=1&limit=10
GET /tasks/projects/:projectId/tasks?sortBy=deadline&order=desc
GET /projects/:id/requests?status=PENDING
```

**Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (endpoint-specific)
- `sortBy`: Sort field (endpoint-specific)
- `order`: `asc` or `desc` (endpoint-specific)

## 🔗 API Reference

For detailed endpoint documentation, see:
- **Human-readable**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Machine-readable**: [api-specification.json](./api-specification.json)
- **TypeScript types**: [src/types/api.ts](./src/types/api.ts)

## 🛠️ Development

### Running Locally

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Run migrations
npm run migrate:dev

# Start dev server
npm run dev

# API will be available at http://localhost:5000/api
```

### Testing API

```bash
# Using curl
curl -X GET http://localhost:5000/api/projects

# Using Postman
# Import the api-specification.json file for auto-generated requests

# Using REST Client (VS Code)
# Create a .http file with requests using standard HTTP syntax
```

## 📞 Support

For issues or questions:
1. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Review [api-specification.json](./api-specification.json)
3. Check response error messages and status codes
4. Check database logs for Prisma errors
5. Contact backend team

## 📄 License

Internal project documentation - Do not distribute without permission.

---

**Last Updated:** February 21, 2026  
**API Version:** 1.0.0
