import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { createTaskSchema, updateTaskSchema } from "./schemas";
import taskService from "./task.service";

export const createTask = catchAsync(async (req, res)  => {
  const projectId = req.params.projectId as string;
  const solverId = (req as any).user.user_id;

  const validated = createTaskSchema.parse(req.body);

  const task = await taskService.createTask(projectId, validated, solverId);

  sendResponse(res, {
    status: 201,
    success: true,
    message: 'Task created successfully',
    data: task,
  });
});

export const getTasks = catchAsync(async (req, res) => {
  const projectId = req.params.projectId as string;
  const user = (req as any).user;

  const tasks = await taskService.getTasksForProject(projectId, user.user_id, user.role);

    sendResponse(res, {
    status: 200,
    success: true,  
      message: 'Tasks retrieved successfully',
    data: tasks,
  });
});

export const getTask = catchAsync(async (req, res) => {
  const taskId = req.params.id as string;
  const user = (req as any).user;

  const task = await taskService.getTaskById(taskId, user.user_id, user.role);

    sendResponse(res, {
    status: 200,
    success: true,
    message: 'Task retrieved successfully',
    data: task,
});
});

export const updateTaskCtrl = catchAsync(async (req, res) => {
  const taskId = req.params.id as string;
  const solverId = (req as any).user.user_id;

  const validated = updateTaskSchema.parse(req.body);

  const updatedTask = await taskService.updateTask(taskId, validated, solverId);

  res.json({
    status: 'success',
    data: { task: updatedTask },
  });
})