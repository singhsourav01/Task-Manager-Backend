// src/routes/commentRoutes.ts
import { Router } from "express";
import CommentController from "../controller/commentController";
import { AuthMiddleware } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// Create comment (All authenticated users)
router.post("/comment", CommentController.createComment);

// Get comments by task (All authenticated users)
router.get("/comment/task/:taskId", CommentController.getCommentsByTaskId);

// Get recent comments by project (All authenticated users)
router.get(
  "/comment/project/:projectId/recent",
  CommentController.getRecentCommentsByProject,
);

// Admin/Manager routes
router.get(
  "/comment/all",
  AuthMiddleware.authorize("ADMIN", "MANAGER"),
  CommentController.getAllComments,
);

router.get(
  "/comment/stats",
  AuthMiddleware.authorize("ADMIN", "MANAGER"),
  CommentController.getCommentStats,
);

// Comment author or Admin can update/delete
router.get("/comment/:id", CommentController.getCommentById);
router.put("/comment/:id", CommentController.updateComment);
router.delete("/comment/:id", CommentController.deleteComment);

export default router;
