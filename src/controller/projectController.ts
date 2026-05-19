// src/controllers/projectController.ts
import { Request, Response } from "express";
import ProjectService from "../services/project.service";

const projectService = new ProjectService();

class ProjectController {
  // Create project
  static async createProject(req: Request, res: Response) {
    try {
      const { name, description, startDate, endDate } = req.body;

      if (!name || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Project name, start date, and end date are required",
        });
      }

      const project = await projectService.createProject({
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdUserId: req.user!.userId,
      });

      return res.status(201).json({
        success: true,
        message: "Project created successfully",
        data: project,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get all projects
  static async getAllProjects(req: Request, res: Response) {
    try {
      const {
        status,
        createdUserId,
        search,
        startDateFrom,
        startDateTo,
        endDateFrom,
        endDateTo,
        page,
        limit,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await projectService.getAllProjects({
        status: status as string,
        createdUserId: createdUserId as string,
        search: search as string,
        startDateFrom: startDateFrom as string,
        startDateTo: startDateTo as string,
        endDateFrom: endDateFrom as string,
        endDateTo: endDateTo as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      });

      return res.json({
        success: true,
        data: result.projects,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get project by ID
  static async getProjectById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);

      return res.json({
        success: true,
        data: project,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update project
  static async updateProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, status, startDate, endDate } = req.body;

      const project = await projectService.updateProject(id, {
        name,
        description,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });

      return res.json({
        success: true,
        message: "Project updated successfully",
        data: project,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete project
  static async deleteProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await projectService.deleteProject(id);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Add members to project
  static async addProjectMembers(req: Request, res: Response) {
    try {
      const { projectId, userIds } = req.body;

      if (!projectId || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Project ID and userIds array are required",
        });
      }

      const members = await projectService.addProjectMembers(
        projectId,
        userIds,
      );

      return res.status(201).json({
        success: true,
        message: "Members added successfully",
        data: members,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Remove member from project
  static async removeProjectMember(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const result = await projectService.removeProjectMember(
        projectId,
        userId,
      );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get project members
  static async getProjectMembers(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const members = await projectService.getProjectMembers(projectId);

      return res.json({
        success: true,
        data: members,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get current user's projects
  static async getMyProjects(req: Request, res: Response) {
    try {
      const { page, limit } = req.query;

      const result = await projectService.getUserProjects(req.user!.userId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      return res.json({
        success: true,
        data: result.projects,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get project statistics
  static async getProjectStats(req: Request, res: Response) {
    try {
      const stats = await projectService.getProjectStats();

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default ProjectController;
