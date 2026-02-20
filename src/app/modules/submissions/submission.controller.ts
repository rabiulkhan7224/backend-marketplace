
import * as submissionService from './submission.service';
import { reviewSubmissionSchema } from './schemas';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/error';

export const submitTask = [

 catchAsync(async (req, res) => {
    const fileUrl= req.body.fileUrl;
    if (!fileUrl) {
      throw new AppError('ZIP file is required', 400);
    }

    const taskId = req.params.taskId as string;
    const solverId = (req as any).user.id;

    const submission = await submissionService.createSubmission(
      taskId,
      solverId,
        fileUrl
    );

    res.status(201).json({
      status: 'success',
      data: { submission },
    });
  }),
];

export const reviewTaskSubmission =catchAsync(async (req, res) => {
  const taskId = req.params.taskId as string;
  const buyerId = (req as any).user.id;

  const validated = reviewSubmissionSchema.parse(req.body);

  const result = await submissionService.reviewSubmission(taskId, buyerId, validated);

  res.json({
    status: 'success',
    data: result,
  });
});

export const getSubmission =catchAsync(async (req, res) => {
  const taskId = req.params.taskId as string;
  const user = (req as any).user;

  const submission = await submissionService.getSubmission(taskId, user.id, user.role);

  res.json({
    status: 'success',
    data: { submission },
  });
});