// src/routes/projectRoutes.ts
import { Router } from "express";
import ProjectController from "../controller/projectController";
import { AuthMiddleware } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// Admin & Manager routes
router.post(
  "/project",
  AuthMiddleware.authorize("ADMIN", "MANAGER", "DEVELOPER"),
  ProjectController.createProject,
);

router.put(
  "project/:id",
  AuthMiddleware.authorize("ADMIN", "MANAGER"),
  ProjectController.updateProject,
);

router.delete(
  "project/:id",
  AuthMiddleware.authorize("ADMIN"),
  ProjectController.deleteProject,
);

// Member management (Admin & Manager)
router.post(
  "/project/members",
  AuthMiddleware.authorize("ADMIN", "MANAGER", "DEVELOPER"),
  ProjectController.addProjectMembers,
);

router.delete(
  "/project/:projectId/members",
  AuthMiddleware.authorize("ADMIN", "MANAGER", "DEVELOPER"),
  ProjectController.removeProjectMember,
);

// View routes (All authenticated users)
router.get("/project", ProjectController.getAllProjects);
router.get("/project/stats", ProjectController.getProjectStats);
router.get("/project/my-projects", ProjectController.getMyProjects);
router.get("/project/:id", ProjectController.getProjectById);
router.get("/project/:projectId/members", ProjectController.getProjectMembers);

export default router;
