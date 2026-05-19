// src/controllers/commentController.ts
import { Request, Response } from "express";
import CommentService from "../services/comment.service";

const commentService = new CommentService();

class CommentController {
  // Create comment
  static async createComment(req: Request, res: Response) {
    try {
      const { taskId, description } = req.body;

      if (!taskId || !description) {
        return res.status(400).json({
          success: false,
          message: "Task ID and comment text are required",
        });
      }

      const comment = await commentService.createComment({
        taskId,
        userId: req.user!.userId,
        description,
      });

      return res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: comment,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get comments by task ID
  static async getCommentsByTaskId(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const { page, limit, sortBy, sortOrder } = req.query;

      const result = await commentService.getCommentsByTaskId(taskId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      });

      return res.json({
        success: true,
        data: result.comments,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get all comments (Admin/Manager)
  static async getAllComments(req: Request, res: Response) {
    try {
      const {
        taskId,
        userId,
        search,
        dateFrom,
        dateTo,
        page,
        limit,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await commentService.getAllComments({
        taskId: taskId as string,
        userId: userId as string,
        search: search as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      });

      return res.json({
        success: true,
        data: result.comments,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get comment by ID
  static async getCommentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const comment = await commentService.getCommentById(id);

      return res.json({
        success: true,
        data: comment,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update comment
  static async updateComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { description } = req.body;

      if (!description) {
        return res.status(400).json({
          success: false,
          message: "Comment text is required",
        });
      }

      const comment = await commentService.updateComment(
        id,
        req.user!.userId,
        req.user!.role,
        { description },
      );

      return res.json({
        success: true,
        message: "Comment updated successfully",
        data: comment,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete comment
  static async deleteComment(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await commentService.deleteComment(
        id,
        req.user!.userId,
        req.user!.role,
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

  // Get recent comments by project
  static async getRecentCommentsByProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { limit } = req.query;

      const comments = await commentService.getRecentCommentsByProject(
        projectId,
        limit ? parseInt(limit as string) : 5,
      );

      return res.json({
        success: true,
        data: comments,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get comment statistics
  static async getCommentStats(req: Request, res: Response) {
    try {
      const { taskId, userId } = req.query;

      const stats = await commentService.getCommentStats(
        taskId as string,
        userId as string,
      );

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

export default CommentController;
