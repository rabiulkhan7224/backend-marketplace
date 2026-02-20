// src/modules/tasks/service.ts
import { z } from 'zod';
import { createTaskSchema, updateTaskSchema } from './schemas';
import { prisma } from '../../shared/prisma';
import AppError from '../../errors/error';
import { ProjectStatus, TaskStatus } from '../../../generated/prisma/enums';


type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const createTask = async (
  projectId: string,
  data: CreateTaskInput,
  solverId: string
) => {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.findUnique({
      where: { id: projectId },
      include: { tasks: true },
    });

    if (!project) throw new AppError('Project not found', 404);
    if (project.assignedSolverId !== solverId) {
      throw new AppError('Only the assigned solver can create tasks', 403);
    }
    if (project.status === ProjectStatus.COMPLETED) {
      throw new AppError('Cannot create tasks on a completed project', 400);
    }

    const task = await tx.task.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        deadline: new Date(data.deadline),
        status: TaskStatus.IN_PROGRESS,
      },
    });

    // Auto-transition project status if this is the first task
    if (project.status === ProjectStatus.ASSIGNED) {
      await tx.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.IN_PROGRESS },
      });
    }

    return task;
  });
};

export const getTasksForProject = async (
  projectId: string,
  userId: string,
  role: string
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { buyerId: true, assignedSolverId: true },
  });

  if (!project) throw new AppError('Project not found', 404);

  // Access control
  const isBuyer = role === 'BUYER' && project.buyerId === userId;
  const isAssignedSolver = role === 'SOLVER' && project.assignedSolverId === userId;
  const isAdmin = role === 'ADMIN';

  if (!isBuyer && !isAssignedSolver && !isAdmin) {
    throw new AppError('You do not have permission to view tasks for this project', 403);
  }

  return prisma.task.findMany({
    where: { projectId },
    include: {
      submission: true,
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const getTaskById = async (
  taskId: string,
  userId: string,
  role: string
) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: { id: true, buyerId: true, assignedSolverId: true },
      },
      submission: true,
    },
  });

  if (!task) throw new AppError('Task not found', 404);

  const isBuyer = role === 'BUYER' && task.project.buyerId === userId;
  const isSolver = role === 'SOLVER' && task.project.assignedSolverId === userId;
  const isAdmin = role === 'ADMIN';

  if (!isBuyer && !isSolver && !isAdmin) {
    throw new AppError('Forbidden: You do not have access to this task', 403);
  }

  return task;
};

export const updateTask = async (
  taskId: string,
  data: UpdateTaskInput,
  solverId: string
) => {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) throw new AppError('Task not found', 404);
    if (task.project.assignedSolverId !== solverId) {
      throw new AppError('Only the assigned solver can update this task', 403);
    }
    if (task.status === TaskStatus.SUBMITTED || task.status === TaskStatus.COMPLETED) {
      throw new AppError('Cannot update a submitted or completed task', 400);
    }

    return tx.task.update({
      where: { id: taskId },
      data,
      include: { submission: true },
    });
  });
};

export default {
  createTask,
  getTasksForProject,
  getTaskById,
  updateTask,
};