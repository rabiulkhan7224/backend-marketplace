// modules/requests/controller.ts (excerpt)
import { Request, Response } from 'express';
import * as service from './request.service';
import { respondRequestSchema } from './schemas';
import catchAsync from '../../utils/catchAsync';

export const requestProject = catchAsync(async (req, res) => {
  const projectId = req.params.id as string;
  const solverId = (req as any).user.id;
  const request = await service.createProjectRequest(projectId, solverId);
  res.status(201).json({ status: 'success', data: request });
});

export const respondRequest = catchAsync(async (req, res) => {
  const requestId = req.params.id as string;
  const buyerId = (req as any).user.id;
  const { status } = respondRequestSchema.parse(req.body);
  const result = await service.respondToRequest(requestId, buyerId, status);
  res.json({ status: 'success', data: result });
});

export const getProjectRequests = catchAsync(async (req, res) => {
  const projectId = req.params.id as string;
  const buyerId = (req as any).user.id;
  const requests = await service.getRequestsForProject(projectId, buyerId);
  res.json({ status: 'success', data: requests });
});