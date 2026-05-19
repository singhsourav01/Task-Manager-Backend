// src/services/taskService.ts
import TaskRepository from "../repositories/taskRepository";
import ProjectRepository from "../repositories/projectRepository";
import UserRepository from "../repositories/userRepository";
import { TaskStatus, Priority } from "@prisma/client";

class TaskService {
  private taskRepository: TaskRepository;
  private projectRepository: ProjectRepository;
  private userRepository: UserRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
    this.projectRepository = new ProjectRepository();
    this.userRepository = new UserRepository();
  }

  // Create task
  async createTask(data: {
    projectId: string;
    name: string;
    description?: string;
    priority?: string;
    startDate: Date;
    endDate: Date;
    assignedTo?: string;
  }) {
    // Check if project exists
    const project = await this.projectRepository.getProjectById(data.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Validate dates
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      throw new Error("End date must be after start date");
    }

    // Validate priority if provided
    if (data.priority) {
      const validPriorities = ["LOW", "MEDIUM", "HIGH"];
      if (!validPriorities.includes(data.priority)) {
        throw new Error(
          `Invalid priority. Must be one of: ${validPriorities.join(", ")}`,
        );
      }
    }

    // Check if assignee exists
    if (data.assignedTo) {
      const user = await this.userRepository.getUserById(data.assignedTo);
      if (!user) {
        throw new Error("Assigned user not found");
      }

      // Check if user is a member of the project
      const isMember = await this.projectRepository.isProjectMember(
        data.projectId,
        data.assignedTo,
      );
      if (!isMember) {
        throw new Error("User is not a member of this project");
      }
    }

    // Create task
    const task = await this.taskRepository.createTask({
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      priority: data.priority as Priority,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      assignedTo: data.assignedTo,
    });

    return task;
  }

  // Get all tasks with pagination and filters
  async getAllTasks(filters: {
    projectId?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
    search?: string;
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const taskFilters: any = {};

    if (filters.projectId) {
      taskFilters.projectId = filters.projectId;
    }

    if (filters.status) {
      const validStatuses = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];
      if (!validStatuses.includes(filters.status)) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        );
      }
      taskFilters.status = filters.status as TaskStatus;
    }

    if (filters.priority) {
      const validPriorities = ["LOW", "MEDIUM", "HIGH"];
      if (!validPriorities.includes(filters.priority)) {
        throw new Error(
          `Invalid priority. Must be one of: ${validPriorities.join(", ")}`,
        );
      }
      taskFilters.priority = filters.priority as Priority;
    }

    if (filters.assignedTo) {
      taskFilters.assignedTo = filters.assignedTo;
    }

    if (filters.search) {
      taskFilters.search = filters.search;
    }

    if (filters.startDateFrom)
      taskFilters.startDateFrom = new Date(filters.startDateFrom);
    if (filters.startDateTo)
      taskFilters.startDateTo = new Date(filters.startDateTo);
    if (filters.endDateFrom)
      taskFilters.endDateFrom = new Date(filters.endDateFrom);
    if (filters.endDateTo) taskFilters.endDateTo = new Date(filters.endDateTo);

    return await this.taskRepository.getAllTasks(taskFilters, {
      page: filters.page || 1,
      limit: filters.limit || 10,
      sortBy: filters.sortBy || "createdAt",
      sortOrder: filters.sortOrder || "desc",
    });
  }

  // Get task by ID
  async getTaskById(id: string) {
    const task = await this.taskRepository.getTaskById(id);
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  }

  // Update task
  async updateTask(
    id: string,
    userId: string,
    userRole: string,
    data: {
      name?: string;
      description?: string;
      status?: string;
      priority?: string;
      startDate?: Date;
      endDate?: Date;
      assignedTo?: string | null;
    },
  ) {
    const task = await this.taskRepository.getTaskById(id);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check permissions
    // Manager/Admin can update any task
    // Developer can only update status of assigned tasks
    if (userRole === "DEVELOPER") {
      // Developer can only update status
      if (data.name || data.description || data.priority || data.assignedTo) {
        throw new Error("Developers can only update task status");
      }

      // Check if task is assigned to developer
      if (task.assignedTo !== userId) {
        throw new Error("You can only update tasks assigned to you");
      }
    }

    // Validate status if provided
    if (data.status) {
      const validStatuses = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];
      if (!validStatuses.includes(data.status)) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        );
      }
    }

    // Validate priority if provided
    if (data.priority) {
      const validPriorities = ["LOW", "MEDIUM", "HIGH"];
      if (!validPriorities.includes(data.priority)) {
        throw new Error(
          `Invalid priority. Must be one of: ${validPriorities.join(", ")}`,
        );
      }
    }

    // Validate dates if both provided
    if (data.startDate && data.endDate) {
      if (new Date(data.startDate) >= new Date(data.endDate)) {
        throw new Error("End date must be after start date");
      }
    }

    // Check if new assignee exists and is project member
    if (data.assignedTo) {
      const user = await this.userRepository.getUserById(data.assignedTo);
      if (!user) {
        throw new Error("Assigned user not found");
      }

      const isMember = await this.projectRepository.isProjectMember(
        task.projectId,
        data.assignedTo,
      );
      if (!isMember) {
        throw new Error("User is not a member of this project");
      }
    }

    const updateData: any = { ...data };
    if (data.status) updateData.status = data.status as TaskStatus;
    if (data.priority) updateData.priority = data.priority as Priority;

    return await this.taskRepository.updateTask(id, updateData);
  }

  // Delete task
  async deleteTask(id: string) {
    const task = await this.taskRepository.getTaskById(id);
    if (!task) {
      throw new Error("Task not found");
    }

    await this.taskRepository.deleteTask(id);
    return { message: "Task deleted successfully" };
  }

  // Get my tasks (for developer)
  async getMyTasks(
    userId: string,
    filters: {
      status?: string;
      priority?: string;
      projectId?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ) {
    const taskFilters: any = {};

    if (filters.status) {
      const validStatuses = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];
      if (!validStatuses.includes(filters.status)) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        );
      }
      taskFilters.status = filters.status as TaskStatus;
    }

    if (filters.priority) {
      taskFilters.priority = filters.priority as Priority;
    }

    if (filters.projectId) {
      taskFilters.projectId = filters.projectId;
    }

    return await this.taskRepository.getTasksByAssignee(userId, taskFilters, {
      page: filters.page || 1,
      limit: filters.limit || 10,
      sortBy: filters.sortBy || "endDate",
      sortOrder: filters.sortOrder || "asc",
    });
  }

  // Assign user to task (multiple assignees)
  async assignUserToTask(taskId: string, userId: string) {
    // Check if task exists
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check if user exists
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is project member
    const isMember = await this.projectRepository.isProjectMember(
      task.projectId,
      userId,
    );
    if (!isMember) {
      throw new Error("User is not a member of this project");
    }

    // Check if user already assigned
    const isAssigned = await this.taskRepository.isUserAssignedToTask(
      taskId,
      userId,
    );
    if (isAssigned) {
      throw new Error("User is already assigned to this task");
    }

    return await this.taskRepository.assignUserToTask(taskId, userId);
  }

  // Remove user from task
  async removeUserFromTask(taskId: string, userId: string) {
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const isAssigned = await this.taskRepository.isUserAssignedToTask(
      taskId,
      userId,
    );
    if (!isAssigned) {
      throw new Error("User is not assigned to this task");
    }

    await this.taskRepository.removeUserFromTask(taskId, userId);
    return { message: "User removed from task successfully" };
  }

  // Get task statistics
  async getTaskStats(projectId?: string) {
    if (projectId) {
      const project = await this.projectRepository.getProjectById(projectId);
      if (!project) {
        throw new Error("Project not found");
      }
    }

    return await this.taskRepository.getTaskStats(projectId);
  }

  // Update task status (simplified for developer)
  async updateTaskStatus(taskId: string, userId: string, status: string) {
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check if task is assigned to user
    if (task.assignedTo !== userId) {
      // Check if user is in assignees list
      const isAssigned = await this.taskRepository.isUserAssignedToTask(
        taskId,
        userId,
      );
      if (!isAssigned) {
        throw new Error("You can only update tasks assigned to you");
      }
    }

    const validStatuses = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      );
    }

    return await this.taskRepository.updateTask(taskId, {
      status: status as TaskStatus,
    });
  }
}

export default TaskService;
