// src/controllers/userController.ts
import { Request, Response } from "express";
import UserService from "../services/user.service";

const userService = new UserService();

class UserController {
  // Get all users (Admin only)
  static async getAllUsers(req: Request, res: Response) {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);

      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

      const result = await userService.getAllUsers(page, limit);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAllActiveUsers(req: Request, res: Response) {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);

      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

      const result = await userService.getAllActiveUsers(page, limit);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get user by ID
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      return res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Create user (Admin only) - Does NOT generate tokens
  static async createUser(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: "Name, email, password, and role are required",
        });
      }

      const user = await userService.createUser({
        name,
        email,
        password,
        role,
      });

      return res.status(201).json({
        success: true,
        message: "User created successfully. User needs to login separately.",
        data: user,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update user role (Admin only)
  static async updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({
          success: false,
          message: "Role is required",
        });
      }

      const user = await userService.updateUserRole(id, role);

      return res.json({
        success: true,
        message: "User role updated. User tokens have been invalidated.",
        data: user,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Toggle user status (Admin only)
  static async toggleUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive (boolean) is required",
        });
      }

      const user = await userService.toggleUserStatus(id, isActive);

      const message = isActive
        ? "User activated successfully"
        : "User deactivated successfully. All active sessions have been terminated.";

      return res.json({
        success: true,
        message,
        data: user,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get current user profile
  static async getProfile(req: Request, res: Response) {
    try {
      const user = await userService.getUserById(req.user!.userId);

      return res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update profile
  static async updateProfile(req: Request, res: Response) {
    try {
      const { name, email } = req.body;
      const user = await userService.updateProfile(req.user!.userId, {
        name,
        email,
      });

      return res.json({
        success: true,
        message: "Profile updated successfully",
        data: user,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Change password
  static async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password and new password are required",
        });
      }

      const result = await userService.changePassword(
        req.user!.userId,
        currentPassword,
        newPassword,
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

  // Delete user (Admin only)
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(id);

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

  // Reset user password (Admin only)
  static async resetPassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password is required",
        });
      }

      const result = await userService.resetUserPassword(id, newPassword);

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
}

export default UserController;
