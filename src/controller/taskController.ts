// src/controllers/taskController.ts
import { Request, Response } from "express";
import TaskService from "../services/task.service";

const taskService = new TaskService();

class TaskController {
  // Create task (Manager/Admin only)
  static async createTask(req: Request, res: Response) {
    try {
      const {
        projectId,
        name,
        description,
        priority,
        startDate,
        endDate,
        assignedTo,
      } = req.body;

      if (!projectId || !name || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message:
            "Project ID, task name, start date, and end date are required",
        });
      }

      const task = await taskService.createTask({
        projectId,
        name,
        description,
        priority,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        assignedTo,
      });

      return res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get all tasks
  static async getAllTasks(req: Request, res: Response) {
    try {
      const {
        projectId,
        status,
        priority,
        assignedTo,
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

      const result = await taskService.getAllTasks({
        projectId: projectId as string,
        status: status as string,
        priority: priority as string,
        assignedTo: assignedTo as string,
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
        data: result.tasks,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get task by ID
  static async getTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await taskService.getTaskById(id);

      return res.json({
        success: true,
        data: task,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update task
  static async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        status,
        priority,
        startDate,
        endDate,
        assignedTo,
      } = req.body;

      const task = await taskService.updateTask(
        id,
        req.user!.userId,
        req.user!.role,
        {
          name,
          description,
          status,
          priority,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          assignedTo,
        },
      );

      return res.json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update task status (Developer)
  static async updateTaskStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      const task = await taskService.updateTaskStatus(
        id,
        req.user!.userId,
        status,
      );

      return res.json({
        success: true,
        message: "Task status updated successfully",
        data: task,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete task (Manager/Admin only)
  static async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await taskService.deleteTask(id);

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

  // Get my tasks (Developer)
  static async getMyTasks(req: Request, res: Response) {
    try {
      const { status, priority, projectId, page, limit, sortBy, sortOrder } =
        req.query;

      const result = await taskService.getMyTasks(req.user!.userId, {
        status: status as string,
        priority: priority as string,
        projectId: projectId as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      });

      return res.json({
        success: true,
        data: result.tasks,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Assign user to task
  static async assignUserToTask(req: Request, res: Response) {
    try {
      const { taskId, userId } = req.body;

      if (!taskId || !userId) {
        return res.status(400).json({
          success: false,
          message: "Task ID and User ID are required",
        });
      }

      const assignment = await taskService.assignUserToTask(taskId, userId);

      return res.status(201).json({
        success: true,
        message: "User assigned to task successfully",
        data: assignment,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Remove user from task
  static async removeUserFromTask(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const result = await taskService.removeUserFromTask(taskId, userId);

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

  // Get task statistics
  static async getTaskStats(req: Request, res: Response) {
    try {
      const { projectId } = req.query;
      const stats = await taskService.getTaskStats(projectId as string);

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

export default TaskController;
