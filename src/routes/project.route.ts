// src/routes/authRoutes.ts
import { Router } from "express";
import AuthController from "../controller/authController";
import { AuthMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refreshToken);

// Protected routes
router.post("/logout", AuthMiddleware.authenticate, AuthController.logout);

export default router;
