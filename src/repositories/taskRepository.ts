// src/repositories/taskRepository.ts
import prisma from "../config/prisma.config";
import { Prisma, TaskStatus, Priority } from "@prisma/client";

interface CreateTaskData {
  projectId: string;
  name: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  startDate: Date;
  endDate: Date;
  assignedTo?: string;
}

interface UpdateTaskData {
  name?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  startDate?: Date;
  endDate?: Date;
  assignedTo?: string | null;
}

interface TaskFilters {
  projectId?: string;
  status?: TaskStatus;
  priority?: Priority;
  assignedTo?: string;
  search?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

class TaskRepository {
  // Create task
  async createTask(data: CreateTaskData) {
    return await prisma.projectTask.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description || null,
        status: data.status || "TODO",
        priority: data.priority || "MEDIUM",
        startDate: data.startDate,
        endDate: data.endDate,
        assignedTo: data.assignedTo || null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  // Get task by ID
  async getTaskById(id: string) {
    return await prisma.projectTask.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
            assignees: true,
          },
        },
      },
    });
  }

  // Get all tasks with pagination and filters
  async getAllTasks(filters: TaskFilters, pagination: PaginationParams) {
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
    } = filters;

    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;

    // Build where clause
    const where: Prisma.ProjectTaskWhereInput = {};

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) where.startDate.gte = startDateFrom;
      if (startDateTo) where.startDate.lte = startDateTo;
    }

    if (endDateFrom || endDateTo) {
      where.endDate = {};
      if (endDateFrom) where.endDate.gte = endDateFrom;
      if (endDateTo) where.endDate.lte = endDateTo;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [tasks, total] = await Promise.all([
      prisma.projectTask.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.projectTask.count({ where }),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  // Update task
  async updateTask(id: string, data: UpdateTaskData) {
    return await prisma.projectTask.update({
      where: { id },
      data,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Delete task
  async deleteTask(id: string) {
    return await prisma.projectTask.delete({
      where: { id },
    });
  }

  // Get tasks assigned to a user
  async getTasksByAssignee(
    userId: string,
    filters: TaskFilters,
    pagination: PaginationParams,
  ) {
    const {
      page = 1,
      limit = 10,
      sortBy = "endDate",
      sortOrder = "asc",
    } = pagination;

    const where: Prisma.ProjectTaskWhereInput = {
      assignedTo: userId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      prisma.projectTask.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.projectTask.count({ where }),
    ]);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  // Assign user to task (multiple assignees)
  async assignUserToTask(taskId: string, userId: string) {
    return await prisma.taskUser.create({
      data: {
        taskId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Remove user from task
  async removeUserFromTask(taskId: string, userId: string) {
    return await prisma.taskUser.delete({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
    });
  }

  // Check if user is assigned to task
  async isUserAssignedToTask(taskId: string, userId: string): Promise<boolean> {
    const assignment = await prisma.taskUser.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
    });
    return !!assignment;
  }

  // Get task statistics
  async getTaskStats(projectId?: string) {
    const where: Prisma.ProjectTaskWhereInput = {};
    if (projectId) {
      where.projectId = projectId;
    }

    const [total, statusCounts, priorityCounts, overdueTasks] =
      await Promise.all([
        prisma.projectTask.count({ where }),
        prisma.projectTask.groupBy({
          by: ["status"],
          where,
          _count: {
            status: true,
          },
        }),
        prisma.projectTask.groupBy({
          by: ["priority"],
          where,
          _count: {
            priority: true,
          },
        }),
        prisma.projectTask.count({
          where: {
            ...where,
            endDate: {
              lt: new Date(),
            },
            status: {
              not: "COMPLETED",
            },
          },
        }),
      ]);

    return {
      total,
      overdueTasks,
      statusCounts: statusCounts.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      priorityCounts: priorityCounts.map((item) => ({
        priority: item.priority,
        count: item._count.priority,
      })),
    };
  }

  // Check if task exists
  async taskExists(id: string): Promise<boolean> {
    const count = await prisma.projectTask.count({
      where: { id },
    });
    return count > 0;
  }

  // Get task with comments
  async getTaskWithComments(taskId: string) {
    return await prisma.projectTask.findUnique({
      where: { id: taskId },
      include: {
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  }
}

export default TaskRepository;
