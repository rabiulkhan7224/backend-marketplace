
import { reviewSubmissionSchema } from './schemas';
import { z } from 'zod';
import { prisma } from '../../shared/prisma';
import AppError from '../../errors/error';
import { TaskStatus } from '../../../generated/prisma/enums';
import { tryCompleteProject } from '../projects/project.service';



export const createSubmission = async (
  taskId: string,
  solverId: string,
  fileUrl: string // path from multer: e.g. 'uploads/submission-123.zip'
) => {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id: taskId },
      include: { project: true ,submission: true },
    });

    if (!task) throw new AppError('Task not found', 404);
    if (task.project.assignedSolverId !== solverId) {
      throw new AppError('Only assigned solver can submit to this task', 403);
    }
    if (task.status !== TaskStatus.IN_PROGRESS) {
      throw new AppError(`Cannot submit task in ${task.status} status`, 400);
    }
    if (task.submission ) {
      throw new AppError('Task already has a submission', 400);
    }

    const submission = await tx.submission.create({
      data: {
        taskId,
        fileUrl,
        submittedAt: new Date(),
      },
    });

    // Update task status
    await tx.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.SUBMITTED },
    });

    return submission;
  });
};

export const reviewSubmission = async (
  taskId: string,
  buyerId: string,
  input: z.infer<typeof reviewSubmissionSchema>
) => {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id: taskId },
      include: { project: true, submission: true },
    });

    if (!task) throw new AppError('Task not found', 404);
    if (!task.submission) throw new AppError('No submission exists for this task', 400);
    if (task.project.buyerId !== buyerId) {
      throw new AppError('Only project buyer can review submissions', 403);
    }
    if (task.status !== TaskStatus.SUBMITTED) {
      throw new AppError(`Cannot review task in ${task.status} status`, 400);
    }

    let newStatus: TaskStatus;

    if (input.action === 'ACCEPT') {
      newStatus = TaskStatus.COMPLETED;
    } else {
      newStatus = TaskStatus.IN_PROGRESS;
      // Optional: you could delete old submission file here if needed
    }

    await tx.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });

    // If accepted → check if project can now be marked COMPLETED
    if (input.action === 'ACCEPT') {
      await tryCompleteProject(task.projectId);
    }

    return {
      taskId,
      newStatus,
      comment: input.comment || null,
    };
  });
};

export const getSubmission = async (taskId: string, userId: string, role: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      submission: true,
      project: { select: { buyerId: true, assignedSolverId: true } },
    },
  });

  if (!task) throw new AppError('Task not found', 404);
  if (!task.submission) throw new AppError('No submission found', 404);

  const isBuyer = role === 'BUYER' && task.project.buyerId === userId;
  const isSolver = role === 'SOLVER' && task.project.assignedSolverId === userId;
  const isAdmin = role === 'ADMIN';

  if (!isBuyer && !isSolver && !isAdmin) {
    throw new AppError('Forbidden: You do not have access to this submission', 403);
  }

  return task.submission;
};

export default {
  createSubmission,
  reviewSubmission,
  getSubmission,
};