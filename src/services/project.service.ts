// src/services/projectService.ts
import ProjectRepository from "../repositories/projectRepository";
import UserRepository from "../repositories/userRepository";
import { ProjectStatus } from "@prisma/client";

class ProjectService {
  private projectRepository: ProjectRepository;
  private userRepository: UserRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
    this.userRepository = new UserRepository();
  }

  // Create project
  async createProject(data: {
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    createdUserId: string;
  }) {
    // Validate dates
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      throw new Error("End date must be after start date");
    }

    // Check if user exists
    const user = await this.userRepository.getUserById(data.createdUserId);
    if (!user) {
      throw new Error("User not found");
    }

    // Create project
    const project = await this.projectRepository.createProject({
      name: data.name,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      createdUserId: data.createdUserId,
    });

    return project;
  }

  // Get all projects with pagination
  async getAllProjects(filters: {
    status?: string;
    createdUserId?: string;
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
    const projectFilters: any = {};

    if (filters.status) {
      const validStatuses = ["PLANNED", "ACTIVE", "COMPLETED", "ON_HOLD"];
      if (!validStatuses.includes(filters.status)) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        );
      }
      projectFilters.status = filters.status as ProjectStatus;
    }

    if (filters.createdUserId) {
      projectFilters.createdUserId = filters.createdUserId;
    }

    if (filters.search) {
      projectFilters.search = filters.search;
    }

    if (filters.startDateFrom) {
      projectFilters.startDateFrom = new Date(filters.startDateFrom);
    }

    if (filters.startDateTo) {
      projectFilters.startDateTo = new Date(filters.startDateTo);
    }

    if (filters.endDateFrom) {
      projectFilters.endDateFrom = new Date(filters.endDateFrom);
    }

    if (filters.endDateTo) {
      projectFilters.endDateTo = new Date(filters.endDateTo);
    }

    return await this.projectRepository.getAllProjects(projectFilters, {
      page: filters.page || 1,
      limit: filters.limit || 10,
      sortBy: filters.sortBy || "createdAt",
      sortOrder: filters.sortOrder || "desc",
    });
  }

  // Get project by ID
  async getProjectById(id: string) {
    const project = await this.projectRepository.getProjectById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    return project;
  }

  // Update project
  async updateProject(
    id: string,
    data: {
      name?: string;
      description?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    // Check if project exists
    const project = await this.projectRepository.getProjectById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    // Validate status if provided
    if (data.status) {
      const validStatuses = ["PLANNED", "ACTIVE", "COMPLETED", "ON_HOLD"];
      if (!validStatuses.includes(data.status)) {
        throw new Error(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        );
      }
    }

    // Validate dates if both provided
    if (data.startDate && data.endDate) {
      if (new Date(data.startDate) >= new Date(data.endDate)) {
        throw new Error("End date must be after start date");
      }
    }

    // If only one date is provided, validate with existing
    if (data.startDate && !data.endDate) {
      if (new Date(data.startDate) >= new Date(project.endDate)) {
        throw new Error("Start date must be before end date");
      }
    }

    if (data.endDate && !data.startDate) {
      if (new Date(project.startDate) >= new Date(data.endDate)) {
        throw new Error("End date must be after start date");
      }
    }

    const updateData: any = { ...data };
    if (data.status) {
      updateData.status = data.status as ProjectStatus;
    }

    return await this.projectRepository.updateProject(id, updateData);
  }

  // Delete project
  async deleteProject(id: string) {
    const project = await this.projectRepository.getProjectById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    await this.projectRepository.deleteProject(id);
    return { message: "Project deleted successfully" };
  }

  // Add member to project
  // Add members to project
  async addProjectMembers(projectId: string, userIds: string[]) {
    // Check project exists
    const project = await this.projectRepository.getProjectById(projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    // Remove duplicate IDs
    const uniqueUserIds = [...new Set(userIds)];

    // Check users exist
    const users = await Promise.all(
      uniqueUserIds.map((userId) => this.userRepository.getUserById(userId)),
    );

    const invalidUsers = users.filter((user) => !user);

    if (invalidUsers.length > 0) {
      throw new Error("One or more users do not exist");
    }

    // Filter existing members
    const existingMembers = await Promise.all(
      uniqueUserIds.map(async (userId) => {
        const isMember = await this.projectRepository.isProjectMember(
          projectId,
          userId,
        );

        return isMember ? userId : null;
      }),
    );

    const existingUserIds = existingMembers.filter(Boolean);

    // Users to insert
    const usersToAdd = uniqueUserIds.filter(
      (id) => !existingUserIds.includes(id),
    );

    if (usersToAdd.length === 0) {
      throw new Error("All users are already project members");
    }

    return await this.projectRepository.addProjectMembers(
      projectId,
      usersToAdd,
    );
  }

  // Remove member from project
  async removeProjectMember(projectId: string, userId: string) {
    // Check if project exists
    const project = await this.projectRepository.getProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user is a member
    const isMember = await this.projectRepository.isProjectMember(
      projectId,
      userId,
    );
    if (!isMember) {
      throw new Error("User is not a member of this project");
    }

    await this.projectRepository.removeProjectMember(projectId, userId);
    return { message: "Member removed successfully" };
  }

  // Get project members
  async getProjectMembers(projectId: string) {
    const project = await this.projectRepository.getProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    return await this.projectRepository.getProjectMembers(projectId);
  }

  // Get projects for a specific user
  async getUserProjects(
    userId: string,
    pagination: {
      page?: number;
      limit?: number;
    },
  ) {
    return await this.projectRepository.getProjectsByUserId(userId, {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
    });
  }

  // Get project statistics
  async getProjectStats() {
    return await this.projectRepository.getProjectStats();
  }
}

export default ProjectService;
