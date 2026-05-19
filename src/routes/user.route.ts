// src/routes/userRoutes.ts
import { Router } from "express";
import UserController from "../controller/userController";
import { AuthMiddleware } from "../middleware/authMiddleware";

const router = Router();
const auth = AuthMiddleware.authenticate;

// Admin only routes
router.get(
  "/users",
  auth,
  AuthMiddleware.authorize("ADMIN"),
  UserController.getAllUsers,
);

router.post(
  "/user",
  auth,
  AuthMiddleware.authorize("ADMIN"),
  UserController.createUser,
);
router.put(
  "/user/:id/role",
  auth,
  AuthMiddleware.authorize("ADMIN"),
  UserController.updateUserRole,
);
router.put(
  "/user/:id/status",
  auth,
  AuthMiddleware.authorize("ADMIN"),
  UserController.toggleUserStatus,
);
router.put(
  "/user/:id/reset-password",
  auth,
  UserController.resetPassword,
);
router.delete(
  "/user/:id",
  auth,
  UserController.deleteUser,
);

// Any authenticated user routes
router.get("/profile", auth, UserController.getProfile);
router.put("/profile", auth, UserController.updateProfile);
router.put("/change-password", auth, UserController.changePassword);
router.get("/user/:id", auth, UserController.getUserById);

export default router;
