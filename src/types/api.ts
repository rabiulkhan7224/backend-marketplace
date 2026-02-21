/**
 * Backend Marketplace - TypeScript API Types
 * Generated from API Specification
 * Last Updated: February 21, 2026
 *
 * This file provides TypeScript interfaces for all API endpoints
 * to ensure type safety in frontend applications.
 */

// ============================================
// AUTH ENDPOINTS
// ============================================

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "BUYER" | "SOLVER";
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "BUYER" | "SOLVER";
  createdAt: string;
}

// ============================================
// PROJECT ENDPOINTS
// ============================================

export interface CreateProjectRequest {
  title: string;
  description: string;
}

export type ProjectStatus =

  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED";

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  buyerId: string;
  buyer?: {
    id: string;
    name: string;
    email: string;
  };
  assignedSolverId: string | null;
  assignedSolver?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  tasks?: Task[];
}

export interface ProjectListResponse {
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ProjectDetailResponse {
  data: Project;
}

// ============================================
// REQUEST ENDPOINTS
// ============================================

export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface ProjectRequest {
  id: string;
  projectId: string;
  solverId: string;
  status: RequestStatus;
  solver?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface CreateRequestResponse {
  id: string;
  projectId: string;
  solverId: string;
  status: "PENDING";
  createdAt: string;
}

export interface RespondRequestRequest {
  status: "ACCEPTED" | "REJECTED";
}

export interface RespondRequestResponse {
  requestId: string;
  status: "ACCEPTED" | "REJECTED";
  projectStatus?: ProjectStatus;
  assignedSolverId?: string;
  rejectedRequestCount?: number;
}

export interface ProjectRequestListResponse {
  data: ProjectRequest[];
}

// ============================================
// TASK ENDPOINTS
// ============================================

export type  TaskStatus = "IN_PROGRESS" | "SUBMITTED" | "COMPLETED";

export interface CreateTaskRequest {
  title: string;
  description: string;
  deadline: string; // ISO 8601 datetime
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  deadline?: string; // ISO 8601 datetime
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  deadline: string; // ISO 8601 datetime
  status: TaskStatus;
  createdAt: string;
  submission?: Submission;
}

export interface CreateTaskResponse {
  id: string;
  projectId: string;
  title: string;
  description: string;
  deadline: string;
  status: "IN_PROGRESS";
  createdAt: string;
}

export interface UpdateTaskResponse {
  id: string;
  projectId: string;
  title: string;
  description: string;
  deadline: string;
  status: TaskStatus;
  updatedAt: string;
}

export interface TaskListResponse {
  data: Task[];
}

export interface TaskDetailResponse {
  data: Task;
}

// ============================================
// SUBMISSION ENDPOINTS
// ============================================

export interface Submission {
  id: string;
  taskId: string;
  fileUrl: string;
  submittedAt: string;
  reviewComment?: string | null;
  reviewedAt?: string | null;
}

export interface SubmissionDetailResponse {
  data: Submission & {
    task: {
      id: string;
      title: string;
      projectId: string;
    };
  };
}

export interface ReviewSubmissionRequest {
  action: "ACCEPT" | "REJECT";
  comment?: string;
}

export interface ReviewSubmissionResponse {
  taskId: string;
  taskStatus: TaskStatus;
  action: "ACCEPT" | "REJECT";
  comment: string | null;
  reviewedAt: string;
}

export interface SubmitTaskResponse {
  id: string;
  taskId: string;
  fileUrl: string;
  submittedAt: string;
  taskStatus: "SUBMITTED";
}

// ============================================
// GENERIC RESPONSE WRAPPER
// ============================================

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  details?: Record<string, string>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  details?: Record<string, string>;
}

// ============================================
// REQUEST/QUERY PARAMETERS
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ProjectQueryParams extends PaginationParams {
  status?: ProjectStatus;
}

export interface TaskQueryParams {
  status?: TaskStatus;
  sortBy?: "deadline" | "createdAt";
  order?: "asc" | "desc";
}

export interface RequestQueryParams {
  status?: RequestStatus;
}

// ============================================
// UTILITY TYPES
// ============================================

export type UserRole = "ADMIN" | "BUYER" | "SOLVER";

export interface AuthHeaders {
  Authorization: `Bearer ${string}`;
}

// ============================================
// API CLIENT CONFIG
// ============================================

export interface ApiClientConfig {
  baseURL: string;
  accessToken?: string;
  refreshToken?: string;
  onTokenRefresh?: (tokens: { accessToken: string; refreshToken: string }) => void;
  onUnauthorized?: () => void;
}

// ============================================
// ENUMS
// ============================================

export enum ProjectStatusEnum {
  OPEN = "OPEN",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum TaskStatusEnum {
  IN_PROGRESS = "IN_PROGRESS",
  SUBMITTED = "SUBMITTED",
  COMPLETED = "COMPLETED",
}

export enum RequestStatusEnum {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export enum UserRoleEnum {
  ADMIN = "ADMIN",
  BUYER = "BUYER",
  SOLVER = "SOLVER",
}

export enum ReviewActionEnum {
  ACCEPT = "ACCEPT",
  REJECT = "REJECT",
}
