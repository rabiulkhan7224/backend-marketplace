import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import * as ProjectService from "./project.service";

export const createProject = catchAsync(async (req, res) => {
  const { title, description } = req.body;
  const buyerId = ( req as any).user.user_id;
    const project = await ProjectService.createProject({ title, description }, buyerId)
    sendResponse(res, {
        status: 201,
        success: true,
        message: 'Project created successfully',
        data: project
    });
});