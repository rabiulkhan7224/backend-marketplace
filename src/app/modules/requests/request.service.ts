import AppError from "../../errors/error";
import { prisma } from "../../shared/prisma";




export const createProjectRequest = async (projectId: string, solverId: string) => {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError('Project not found', 404);
    if (project.status !== 'OPEN') {
      throw new AppError('Can only request OPEN projects', 400);
    }

    const existing = await tx.projectRequest.findFirst({
      where: { projectId, solverId },
    });
    if (existing) {
      throw new AppError('You already requested this project', 400);
    }

    const request = await tx.projectRequest.create({
      data: {
        projectId,
        solverId,
        status: 'PENDING',
      },
    });

    return request;
  });
};

export const respondToRequest = async (
  requestId: string,
  buyerId: string,
  action: 'ACCEPTED' | 'REJECTED'
) => {
  return prisma.$transaction(async (tx) => {
    const request = await tx.projectRequest.findUnique({
      where: { id: requestId },
      include: { project: true },
    });

    if (!request) throw new AppError('Request not found', 404);
    if (request.project.buyerId !== buyerId) {
      throw new AppError('Only project owner can respond', 403);
    }
    if (request.status !== 'PENDING') {
      throw new AppError('Request already processed', 400);
    }
    if (request.project.status !== 'OPEN') {
      throw new AppError('Project is no longer OPEN', 400);
    }

    await tx.projectRequest.update({
      where: { id: requestId },
      data: { status: action },
    });

    if (action === 'ACCEPTED') {
      // Accept → assign solver & reject others
      await tx.projectRequest.updateMany({
        where: {
          projectId: request.projectId,
          id: { not: requestId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      await tx.project.update({
        where: { id: request.projectId },
        data: {
          status: 'ASSIGNED',
          assignedSolverId: request.solverId,
        },
      });
    }

    return { requestId, status: action };
  });
};

export const getRequestsForProject = async (projectId: string, buyerId: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.buyerId !== buyerId) {
    throw new AppError('Forbidden or project not found', 403);
  }

  return prisma.projectRequest.findMany({
    where: { projectId },
    include: {
      solver: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};