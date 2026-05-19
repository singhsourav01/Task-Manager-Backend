// src/repositories/commentRepository.ts
import prisma from "../config/prisma.config";

interface CreateCommentData {
  taskId: string;
  userId: string;
  description: string;
}

interface UpdateCommentData {
  description: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

class CommentRepository {
  // Create comment
  async createComment(data: CreateCommentData) {
    return await prisma.comment.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        description: data.description,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        task: {
          select: {
            id: true,
            name: true,
            projectId: true,
          },
        },
      },
    });
  }

  // Get comment by ID
  async getCommentById(id: string) {
    return await prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        task: {
          select: {
            id: true,
            name: true,
            projectId: true,
          },
        },
      },
    });
  }

  // Get comments by task ID with pagination
  async getCommentsByTaskId(taskId: string, pagination: PaginationParams) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { taskId },
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
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.comment.count({
        where: { taskId },
      }),
    ]);

    return {
      comments,
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

  // Get all comments (with filters)
  async getAllComments(
    filters: {
      taskId?: string;
      userId?: string;
      search?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
    pagination: PaginationParams,
  ) {
    const { taskId, userId, search, dateFrom, dateTo } = filters;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;

    const where: any = {};

    if (taskId) {
      where.taskId = taskId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.description = { contains: search };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          task: {
            select: {
              id: true,
              name: true,
              projectId: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ]);

    return {
      comments,
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

  // Update comment
  async updateComment(id: string, data: UpdateCommentData) {
    return await prisma.comment.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        task: {
          select: {
            id: true,
            name: true,
            projectId: true,
          },
        },
      },
    });
  }

  // Delete comment
  async deleteComment(id: string) {
    return await prisma.comment.delete({
      where: { id },
    });
  }

  // Get comment count by task
  async getCommentCountByTask(taskId: string): Promise<number> {
    return await prisma.comment.count({
      where: { taskId },
    });
  }

  // Get comment count by user
  async getCommentCountByUser(userId: string): Promise<number> {
    return await prisma.comment.count({
      where: { userId },
    });
  }

  // Get recent comments by project
  async getRecentCommentsByProject(projectId: string, limit: number = 5) {
    return await prisma.comment.findMany({
      where: {
        task: {
          projectId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  }

  // Check if comment exists
  async commentExists(id: string): Promise<boolean> {
    const count = await prisma.comment.count({
      where: { id },
    });
    return count > 0;
  }
}

export default CommentRepository;
