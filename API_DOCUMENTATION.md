# Backend Marketplace - API Documentation

**Last Updated:** February 21, 2026  
**API Base URL:** `http://localhost:5000/api`

---

## Table of Contents
1. [Authentication](#authentication)
2. [Projects](#projects)
3. [Requests](#requests)
4. [Tasks](#tasks)
5. [Submissions](#submissions)
6. [Response Format](#response-format)
7. [Error Handling](#error-handling)

---

## Authentication

### Register User

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/auth/register` |
| **Description** | Create a new user account |
| **Auth / Role** | None (Public) |
| **Status Code** | 201 Created |

**Request Body:**
```json
{
  "name": "string (min: 2 characters)",
  "email": "string (valid email format)",
  "password": "string (min: 8 characters)"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "BUYER | SOLVER",
    "createdAt": "ISO 8601 datetime"
  }
}
```

---

### Login User

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/auth/login` |
| **Description** | Authenticate user and receive tokens |
| **Auth / Role** | None (Public) |
| **Status Code** | 200 OK |

**Request Body:**
```json
{
  "email": "string (valid email)",
  "password": "string"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "BUYER | SOLVER",
    "accessToken": "jwt_token",
    "refreshToken": "jwt_token"
  }
}
```

**Headers (Responses include):**
- `Authorization: Bearer <accessToken>`

---

### Get Current User

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/auth/me` |
| **Description** | Retrieve current authenticated user's profile |
| **Auth / Role** | Required - Any Role |
| **Status Code** | 200 OK |

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "User profile retrieved",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "BUYER | SOLVER",
    "createdAt": "ISO 8601 datetime"
  }
}
```

---

## Projects

### Create Project

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/projects` |
| **Description** | Create a new project (BUYER only) |
| **Auth / Role** | Required - BUYER |
| **Status Code** | 201 Created |

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (required)"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Project created successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "status": "OPEN | ASSIGNED | IN_PROGRESS | COMPLETED",
    "buyerId": "uuid",
    "assignedSolverId": null,
    "createdAt": "ISO 8601 datetime"
  }
}
```

---

### Get All Projects

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/projects` |
| **Description** | List all projects (paginated) |
| **Auth / Role** | None (Public) |
| **Status Code** | 200 OK |

**Query Parameters:**
```
?page=number (default: 1)
&limit=number (default: 10)
&status=OPEN|ASSIGNED|IN_PROGRESS|COMPLETED (optional filter)
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Projects retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "status": "OPEN",
      "buyerId": "uuid",
      "assignedSolverId": null,
      "createdAt": "ISO 8601 datetime"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

---

### Get Project by ID

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/projects/:id` |
| **Description** | Retrieve a specific project with all details |
| **Auth / Role** | None (Public) |
| **Status Code** | 200 OK |

**Path Parameters:**
```
:id = project UUID
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Project retrieved successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "status": "OPEN | ASSIGNED | IN_PROGRESS | COMPLETED",
    "buyerId": "uuid",
    "buyer": {
      "id": "uuid",
      "name": "string",
      "email": "string"
    },
    "assignedSolverId": "uuid | null",
    "assignedSolver": {
      "id": "uuid",
      "name": "string",
      "email": "string"
    },
    "createdAt": "ISO 8601 datetime",
    "tasks": [
      {
        "id": "uuid",
        "title": "string",
        "status": "IN_PROGRESS | SUBMITTED | COMPLETED"
      }
    ]
  }
}
```

---

## Requests

### Request Project (SOLVER)

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/projects/:id/request` |
| **Description** | SOLVER sends a request to work on an OPEN project |
| **Auth / Role** | Required - SOLVER |
| **Status Code** | 201 Created |

**Path Parameters:**
```
:id = project UUID
```

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```
(Empty - solverId extracted from JWT token)
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Project request created successfully",
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "solverId": "uuid",
    "status": "PENDING",
    "createdAt": "ISO 8601 datetime"
  }
}
```

**Error Cases:**
- `404` - Project not found
- `400` - Project not OPEN or already requested by this solver
- `401` - Unauthorized (not SOLVER role)

---

### Respond to Request (BUYER)

| Property | Value |
|----------|-------|
| **Method** | `PATCH` |
| **Endpoint** | `/projects/:id/respond` |
| **Description** | BUYER accepts or rejects a SOLVER's request |
| **Auth / Role** | Required - BUYER |
| **Status Code** | 200 OK |

**Path Parameters:**
```
:id = project UUID
```

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "status": "ACCEPTED | REJECTED"
}
```

**Response (on ACCEPTED):**
```json
{
  "statusCode": 200,
  "message": "Request accepted successfully",
  "data": {
    "requestId": "uuid",
    "status": "ACCEPTED",
    "projectStatus": "ASSIGNED",
    "assignedSolverId": "uuid",
    "rejectedRequestCount": 3
  }
}
```

**Response (on REJECTED):**
```json
{
  "statusCode": 200,
  "message": "Request rejected successfully",
  "data": {
    "requestId": "uuid",
    "status": "REJECTED"
  }
}
```

**Error Cases:**
- `403` - Not the project owner (BUYER)
- `400` - Request already processed or project not OPEN

---

### Get Project Requests (BUYER)

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/projects/:id/requests` |
| **Description** | BUYER views all SOLVERs who requested their project |
| **Auth / Role** | Required - BUYER |
| **Status Code** | 200 OK |

**Path Parameters:**
```
:id = project UUID
```

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
```
?status=PENDING|ACCEPTED|REJECTED (optional filter)
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Project requests retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "status": "PENDING",
      "solver": {
        "id": "uuid",
        "name": "string",
        "email": "string"
      },
      "createdAt": "ISO 8601 datetime"
    }
  ]
}
```

---

## Tasks

### Create Task (SOLVER)

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/tasks/projects/:projectId/tasks` |
| **Description** | SOLVER creates a task for an assigned project |
| **Auth / Role** | Required - SOLVER (must be assigned to project) |
| **Status Code** | 201 Created |

**Path Parameters:**
```
:projectId = project UUID
```

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "title": "string (min: 3 characters)",
  "description": "string (min: 10 characters)",
  "deadline": "ISO 8601 datetime (e.g., 2026-03-15T18:00:00Z)"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Task created successfully",
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "title": "string",
    "description": "string",
    "deadline": "ISO 8601 datetime",
    "status": "IN_PROGRESS",
    "createdAt": "ISO 8601 datetime"
  }
}
```

**Error Cases:**
- `403` - Not assigned SOLVER or project not ASSIGNED
- `400` - Invalid deadline format or past date

---

### Get Project Tasks

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/tasks/projects/:projectId/tasks` |
| **Description** | List all tasks for a project (BUYER or assigned SOLVER) |
| **Auth / Role** | Required - BUYER or assigned SOLVER |
| **Status Code** | 200 OK |

**Path Parameters:**
```
:projectId = project UUID
```

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Query Parameters:**
```
?status=IN_PROGRESS|SUBMITTED|COMPLETED (optional filter)
?sortBy=deadline|createdAt (optional)
?order=asc|desc (optional)
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "title": "string",
      "description": "string",
      "deadline": "ISO 8601 datetime",
      "status": "IN_PROGRESS | SUBMITTED | COMPLETED",
      "createdAt": "ISO 8601 datetime",
      "submission": {
        "id": "uuid",
        "fileUrl": "string",
        "submittedAt": "ISO 8601 datetime"
      }
    }
  ]
}
```

---

### Get Single Task

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/tasks/tasks/:id` |
| **Description** | Retrieve a specific task with details and submission |
| **Auth / Role** | Required - BUYER or assigned SOLVER |
| **Status Code** | 200 OK |

**Path Parameters:**
```
:id = task UUID
```

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Task retrieved successfully",
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "title": "string",
    "description": "string",
    "deadline": "ISO 8601 datetime",
    "status": "IN_PROGRESS | SUBMITTED | COMPLETED",
    "createdAt": "ISO 8601 datetime",
    "submission": {
      "id": "uuid",
      "fileUrl": "string (pre-signed URL)",
      "submittedAt": "ISO 8601 datetime"
    }
  }
}
```

---

### Update Task (SOLVER)

| Property | Value |
|----------|-------|
| **Method** | `PATCH` |
| **Endpoint** | `/tasks/tasks/:id` |
| **Description** | SOLVER updates task metadata (title, description, deadline) before submission |
| **Auth / Role** | Required - SOLVER (assigned to project) |
| **Status Code** | 200 OK |

**Path Parameters:**
```
:id = task UUID
```

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body (all optional, at least one required):**
```json
{
  "title": "string (min: 3 characters, optional)",
  "description": "string (min: 10 characters, optional)",
  "deadline": "ISO 8601 datetime (optional)"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Task updated successfully",
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "title": "string",
    "description": "string",
    "deadline": "ISO 8601 datetime",
    "status": "IN_PROGRESS",
    "updatedAt": "ISO 8601 datetime"
  }
}
```

**Error Cases:**
- `400` - No fields provided or task already SUBMITTED
- `403` - Not assigned SOLVER

---

## Submissions

### Submit Task (SOLVER)

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Endpoint** | `/submissions/tasks/:taskId/submit` |
| **Description** | SOLVER uploads a ZIP file submission for a task |
| **Auth / Role** | Required - SOLVER (assigned to project) |
| **Status Code** | 201 Created |

**Path Parameters:**
```
:taskId = task UUID
```

**Request Headers:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**
```
file: File (ZIP archive, max 50 MB)
```

**Response:**
```json
{
  "statusCode": 201,
  "message": "Submission created successfully",
  "data": {
    "id": "uuid",
    "taskId": "uuid",
    "fileUrl": "string (S3 URL or storage URL)",
    "submittedAt": "ISO 8601 datetime",
    "taskStatus": "SUBMITTED"
  }
}
```

**Error Cases:**
- `400` - Task already submitted or file validation failed
- `403` - Not assigned SOLVER
- `413` - File too large

---

### Review Submission (BUYER)

| Property | Value |
|----------|-------|
| **Method** | `PATCH` |
| **Endpoint** | `/submissions/tasks/:taskId/review` |
| **Description** | BUYER reviews and accepts/rejects SOLVER's submission |
| **Auth / Role** | Required - BUYER (project owner) |
| **Status Code** | 200 OK |

**Path Parameters:**
```
:taskId = task UUID
```

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "action": "ACCEPT | REJECT",
  "comment": "string (max: 500 characters, optional)"
}
```

**Response (on ACCEPT):**
```json
{
  "statusCode": 200,
  "message": "Submission accepted successfully",
  "data": {
    "taskId": "uuid",
    "taskStatus": "COMPLETED",
    "action": "ACCEPT",
    "comment": "string | null",
    "reviewedAt": "ISO 8601 datetime"
  }
}
```

**Response (on REJECT):**
```json
{
  "statusCode": 200,
  "message": "Submission rejected successfully",
  "data": {
    "taskId": "uuid",
    "taskStatus": "IN_PROGRESS",
    "action": "REJECT",
    "comment": "string | null",
    "reviewedAt": "ISO 8601 datetime"
  }
}
```

**Error Cases:**
- `400` - Submission not found or already reviewed
- `403` - Not project owner (BUYER)

---

### Get Submission Details

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Endpoint** | `/submissions/tasks/:taskId/submission` |
| **Description** | Retrieve submission details (BUYER, SOLVER, or ADMIN) |
| **Auth / Role** | Required - BUYER, assigned SOLVER, or ADMIN |
| **Status Code** | 200 OK |

**Path Parameters:**
```
:taskId = task UUID
```

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Submission retrieved successfully",
  "data": {
    "id": "uuid",
    "taskId": "uuid",
    "task": {
      "id": "uuid",
      "title": "string",
      "projectId": "uuid"
    },
    "fileUrl": "string (pre-signed URL)",
    "submittedAt": "ISO 8601 datetime",
    "reviewComment": "string | null",
    "reviewedAt": "ISO 8601 datetime | null"
  }
}
```

**Error Cases:**
- `404` - Submission not found
- `403` - Unauthorized (not related to task/project)

---

## Response Format

### Success Response Structure
All successful responses follow this format:

```json
{
  "statusCode": 200,
  "message": "Description of what was done",
  "data": {
    /* endpoint-specific data */
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Error Response Structure
All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "details": {
    "field": "error_details"
  }
}
```

---

## Error Handling

### Common HTTP Status Codes

| Status Code | Meaning | Common Causes |
|-------------|---------|--------------|
| `200` | OK | Successful GET/PATCH request |
| `201` | Created | Successful POST request (resource created) |
| `400` | Bad Request | Invalid input, validation failed, business logic error |
| `401` | Unauthorized | Missing or invalid authentication token |
| `403` | Forbidden | Authenticated but insufficient permissions/role |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Duplicate entry or conflicting state |
| `413` | Payload Too Large | File upload exceeds size limit |
| `500` | Internal Server Error | Server error |

### Prisma-Specific Errors

| Error Code | Meaning | Example |
|-----------|---------|---------|
| `P2001` | Not found | Record doesn't exist in database |
| `P2002` | Unique constraint failed | Email already exists or duplicate request |
| `P2025` | Record not found | Can't perform operation on deleted record |
| `P2028` | Transaction timeout | Connection pool exhausted |

---

## Authentication Flow

### Token-Based Authentication

1. **Register** → Get user account
2. **Login** → Receive `accessToken` and `refreshToken`
3. **Use accessToken** → Send in `Authorization: Bearer <token>` header
4. **Token expiration** → Use `refreshToken` to get new `accessToken`

### Role-Based Access Control (RBAC)

- **BUYER**: Can create projects, view requests, review submissions
- **SOLVER**: Can request projects, create tasks (if assigned), submit solutions
- **ADMIN**: Full access to all resources

---

## Rate Limiting

Default rate limits (may vary):
- **Auth endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **File uploads**: 10 requests per minute

---

## Base URL Configuration

**Development:**
```
http://localhost:5000/api
```

**Production:**
```
https://your-domain.com/api
```

---

## Support & Questions

For API integration help or issues, please refer to the JSON API specification file: `api-specification.json`
