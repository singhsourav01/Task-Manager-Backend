// src/routes/userRoutes.ts
import { Router } from "express";
import UserController from "../controller/userController";
import { AuthMiddleware } from "../middleware/authMiddleware";

const router = Router();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// Admin only routes
router.get(
  "/users",
  // AuthMiddleware.authorize("ADMIN"),
  UserController.getAllUsers,
);

router.post(
  "/user",
  // AuthMiddleware.authorize("ADMIN"),
  UserController.createUser,
);
router.put(
  "/user/:id/role",
  // AuthMiddleware.authorize("ADMIN"),
  UserController.updateUserRole,
);
router.put(
  "/user/:id/status",
  // AuthMiddleware.authorize("ADMIN"),
  UserController.toggleUserStatus,
);
router.put(
  "/user/:id/reset-password",
  // AuthMiddleware.authorize("ADMIN"),
  UserController.resetPassword,
);
router.delete(
  "/user/:id",
  // AuthMiddleware.authorize("ADMIN"),
  UserController.deleteUser,
);

// Any authenticated user routes
router.get("/profile", UserController.getProfile);
router.put("/profile", UserController.updateProfile);
router.put("/change-password", UserController.changePassword);
router.get("/user/:id", UserController.getUserById);

export default router;
