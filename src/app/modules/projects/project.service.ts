import z from "zod";
import { ProjectStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../shared/prisma";
import { createProjectSchema } from "./project.schemas";
import AppError from "../../errors/error";


interface CreateProjectInput {
    title: string;
    description: string;
}

export const createProject = async (data: CreateProjectInput, buyerId: string) => {
  return prisma.project.create({
    data: {
      ...data,
      buyerId,
      status: ProjectStatus.OPEN,
    },
  });
};

export const getProjects = async () => {
  return prisma.project.findMany();
};

export const getProjectById = async (id: string) => {
  return prisma.project.findUnique({
    where: { id },
  });
};


export const getProjectByIdAuth = async (
  projectId: string,
  currentUserId: string,
  currentUserRole: string
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignedSolver: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      tasks: {
        include: {
          submission: {
            select: {
              id: true,
              fileUrl: true,
              submittedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      requests: {
        include: {
          solver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  // Access control
  const isBuyer = currentUserRole === 'BUYER' && project.buyerId === currentUserId;
  const isAssignedSolver = currentUserRole === 'SOLVER' && project.assignedSolverId === currentUserId;
  const isAdmin = currentUserRole === 'ADMIN';

  if (!isBuyer && !isAssignedSolver && !isAdmin) {
    throw new AppError('You do not have permission to view this project', 403);
  }

  // Hide sensitive fields from solver if not assigned
  if (isAssignedSolver && !isBuyer) {
    // Solver only sees their own assigned project, hide requests
    return {
      ...project,
      requests: undefined, // hide requests from solver
    };
  }

  // Buyer and admin see everything
  return project;
};

export const tryCompleteProject = async (projectId: string) => {
  return prisma.$transaction(async (tx) => {
    const incompleteCount = await tx.task.count({
      where: {
        projectId,
        status: { not: ProjectStatus.COMPLETED },
      },
    });

    if (incompleteCount === 0) {
      const project = await tx.project.findUnique({ where: { id: projectId } });
      if (project && project.status !== ProjectStatus.COMPLETED) {
        return tx.project.update({
          where: { id: projectId },
          data: { status: ProjectStatus.COMPLETED },
        });
      }
    }

    return null; // no change
  });
};