// src/routes/taskRoutes.ts
import { Router } from "express";
import TaskController from "../controller/taskController";
import { AuthMiddleware } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// Manager/Admin routes
router.post(
  "/task",
  AuthMiddleware.authorize("ADMIN", "MANAGER", "DEVELOPER"),
  TaskController.createTask,
);

router.put(
  "/task/:id",
  AuthMiddleware.authorize("ADMIN", "MANAGER"),
  TaskController.updateTask,
);

router.delete(
  "/:id",
  AuthMiddleware.authorize("ADMIN", "MANAGER"),
  TaskController.deleteTask,
);

router.post(
  "task/assign",
  AuthMiddleware.authorize("ADMIN", "MANAGER"),
  TaskController.assignUserToTask,
);

router.delete(
  "/task/:taskId/assign",
  AuthMiddleware.authorize("ADMIN", "MANAGER"),
  TaskController.removeUserFromTask,
);

// Developer routes
router.get(
  "/task/my-tasks",
  AuthMiddleware.authorize("DEVELOPER", "MANAGER", "ADMIN"),
  TaskController.getMyTasks,
);

router.patch(
  "/task/:id/status",
  AuthMiddleware.authorize("DEVELOPER", "MANAGER", "ADMIN"),
  TaskController.updateTaskStatus,
);

// Common routes (all authenticated users)
router.get("/task", TaskController.getAllTasks);
router.get("/task/stats", TaskController.getTaskStats);
router.get("/task/:id", TaskController.getTaskById);

export default router;
