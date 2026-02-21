import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import * as ProjectService from "./project.service";

export const createProject = catchAsync(async (req, res) => {
  const { title, description } = req.body;
  const buyerId = ( req as any).user.id;
    const project = await ProjectService.createProject({ title, description }, buyerId)
    sendResponse(res, {
        status: 201,
        success: true,
        message: 'Project created successfully',
        data: project
    });
});

export const getProjects = catchAsync(async (req, res) => {
    const projects = await ProjectService.getProjects();
    sendResponse(res, {
        status: 200,
        success: true,
        message: 'Projects retrieved successfully',
        data: projects
    });
});

export const getProjectById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const project = await ProjectService.getProjectById(id as string);
    if (!project) { 
        return sendResponse(res, {
          status: 404,
          success: false,
          message: 'Project not found',
          data: undefined
        });
    } 
    sendResponse(res, {

        status: 200,
        success: true,
        message: 'Project retrieved successfully',
        data: project
    });
});
// authenticated version of getProjectById with access control
export const getProjectByIdAuth = catchAsync(async (req, res) => {
  const projectId = req.params.id as string;
  const user = (req as any).user;
    const project = await ProjectService.getProjectByIdAuth(projectId, user.id, user.role); 
    if (!project) {
        return sendResponse(res, {
          status: 404,  
            success: false,
            message: 'Project not found',
            data: undefined
        });
    }
    sendResponse(res, {
        status: 200,
        success: true,
        message: 'Project retrieved successfully',
        data: project
    });
});

