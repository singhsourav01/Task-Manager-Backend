// src/services/commentService.ts
import CommentRepository from "../repositories/commentRepository";
import TaskRepository from "../repositories/taskRepository";
import ProjectRepository from "../repositories/projectRepository";

class CommentService {
  private commentRepository: CommentRepository;
  private taskRepository: TaskRepository;
  private projectRepository: ProjectRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
    this.taskRepository = new TaskRepository();
    this.projectRepository = new ProjectRepository();
  }

  // Create comment
  async createComment(data: {
    taskId: string;
    userId: string;
    description: string;
  }) {
    // Validate description
    if (!data.description || data.description.trim().length === 0) {
      throw new Error("Comment text is required");
    }

    if (data.description.length > 5000) {
      throw new Error("Comment text cannot exceed 5000 characters");
    }

    // Check if task exists
    const task = await this.taskRepository.getTaskById(data.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check if user is project member or task assignee
    const isProjectMember = await this.projectRepository.isProjectMember(
      task.projectId,
      data.userId,
    );

    if (!isProjectMember && task.assignedTo !== data.userId) {
      throw new Error(
        "You must be a project member or task assignee to comment",
      );
    }

    // Create comment
    const comment = await this.commentRepository.createComment({
      taskId: data.taskId,
      userId: data.userId,
      description: data.description.trim(),
    });

    return comment;
  }

  // Get comments by task ID
  async getCommentsByTaskId(
    taskId: string,
    pagination: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
  ) {
    // Check if task exists
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    return await this.commentRepository.getCommentsByTaskId(taskId, {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      sortBy: pagination.sortBy || "createdAt",
      sortOrder: pagination.sortOrder || "desc",
    });
  }

  // Get all comments (Admin/Manager)
  async getAllComments(filters: {
    taskId?: string;
    userId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const commentFilters: any = {};

    if (filters.taskId) {
      commentFilters.taskId = filters.taskId;
    }

    if (filters.userId) {
      commentFilters.userId = filters.userId;
    }

    if (filters.search) {
      commentFilters.search = filters.search;
    }

    if (filters.dateFrom) {
      commentFilters.dateFrom = new Date(filters.dateFrom);
    }

    if (filters.dateTo) {
      commentFilters.dateTo = new Date(filters.dateTo);
    }

    return await this.commentRepository.getAllComments(commentFilters, {
      page: filters.page || 1,
      limit: filters.limit || 10,
      sortBy: filters.sortBy || "createdAt",
      sortOrder: filters.sortOrder || "desc",
    });
  }

  // Get comment by ID
  async getCommentById(id: string) {
    const comment = await this.commentRepository.getCommentById(id);
    if (!comment) {
      throw new Error("Comment not found");
    }
    return comment;
  }

  // Update comment
  async updateComment(
    id: string,
    userId: string,
    userRole: string,
    data: {
      description: string;
    },
  ) {
    // Check if comment exists
    const comment = await this.commentRepository.getCommentById(id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Only comment author or Admin can update
    if (comment.userId !== userId && userRole !== "ADMIN") {
      throw new Error("You can only edit your own comments");
    }

    // Validate description
    if (!data.description || data.description.trim().length === 0) {
      throw new Error("Comment text is required");
    }

    if (data.description.length > 5000) {
      throw new Error("Comment text cannot exceed 5000 characters");
    }

    // Check if comment is not too old to edit (optional - 24 hours)
    const commentAge = Date.now() - new Date(comment.createdAt).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (commentAge > maxAge && userRole !== "ADMIN") {
      throw new Error("Comments can only be edited within 24 hours");
    }

    return await this.commentRepository.updateComment(id, {
      description: data.description.trim(),
    });
  }

  // Delete comment
  async deleteComment(id: string, userId: string, userRole: string) {
    // Check if comment exists
    const comment = await this.commentRepository.getCommentById(id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Only comment author, Admin, or Manager can delete
    if (comment.userId !== userId && !["ADMIN", "MANAGER"].includes(userRole)) {
      throw new Error("You can only delete your own comments");
    }

    await this.commentRepository.deleteComment(id);
    return { message: "Comment deleted successfully" };
  }

  // Get recent comments by project
  async getRecentCommentsByProject(projectId: string, limit: number = 5) {
    const project = await this.projectRepository.getProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    return await this.commentRepository.getRecentCommentsByProject(
      projectId,
      limit,
    );
  }

  // Get comment statistics
  async getCommentStats(taskId?: string, userId?: string) {
    const stats: any = {};

    if (taskId) {
      stats.commentsByTask =
        await this.commentRepository.getCommentCountByTask(taskId);
    }

    if (userId) {
      stats.commentsByUser =
        await this.commentRepository.getCommentCountByUser(userId);
    }

    return stats;
  }
}

export default CommentService;
