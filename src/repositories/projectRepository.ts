// src/repositories/projectRepository.ts
import prisma from "../config/prisma.config";
import { Prisma, ProjectStatus } from "@prisma/client";

interface CreateProjectData {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status?: ProjectStatus;
  createdUserId: string;
}

interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
}

interface ProjectFilters {
  status?: ProjectStatus;
  createdUserId?: string;
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

class ProjectRepository {
  // Create project
  async createProject(data: CreateProjectData) {
    return await prisma.project.create({
      data: {
        name: data.name,
        description: data.description || null,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status || "PLANNED",
        createdUserId: data.createdUserId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Get project by ID
  async getProjectById(id: string) {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
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
        },
        tasks: {
          select: {
            id: true,
            name: true,
            status: true,
            priority: true,
          },
        },
        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
      },
    });
  }

  // Get all projects with pagination and filters
  async getAllProjects(filters: ProjectFilters, pagination: PaginationParams) {
    const {
      status,
      createdUserId,
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
    const where: Prisma.ProjectWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (createdUserId) {
      where.createdUserId = createdUserId;
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
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              tasks: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return {
      projects,
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

  // Update project
  async updateProject(id: string, data: UpdateProjectData) {
    return await prisma.project.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
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
        },
      },
    });
  }

  // Delete project
  async deleteProject(id: string) {
    return await prisma.project.delete({
      where: { id },
    });
  }

  // Add member to project
  // Add multiple members to project
  async addProjectMembers(projectId: string, userIds: string[]) {
    await prisma.projectMember.createMany({
      data: userIds.map((userId) => ({
        projectId,
        userId,
      })),

      skipDuplicates: true,
    });

    return await prisma.projectMember.findMany({
      where: {
        projectId,
        userId: {
          in: userIds,
        },
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
      },
    });
  }

  // Remove member from project
  async removeProjectMember(projectId: string, userId: string) {
    return await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }

  // Get project members
  async getProjectMembers(projectId: string) {
    return await prisma.projectMember.findMany({
      where: { projectId },
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
    });
  }

  // Check if user is project member
  async isProjectMember(projectId: string, userId: string): Promise<boolean> {
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
    return !!member;
  }

  // Check if project exists
  async projectExists(id: string): Promise<boolean> {
    const count = await prisma.project.count({
      where: { id },
    });
    return count > 0;
  }

  // Get project statistics
  async getProjectStats() {
    const [total, statusCounts] = await Promise.all([
      prisma.project.count(),
      prisma.project.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),
    ]);

    return {
      total,
      statusCounts: statusCounts.map((item: any) => ({
        status: item.status,
        count: item._count.status,
      })),
    };
  }

  // Get projects by user (where user is a member)
  async getProjectsByUserId(userId: string, pagination: PaginationParams) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              members: true,
              tasks: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
      }),
    ]);

    return {
      projects,
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
}

export default ProjectRepository;
