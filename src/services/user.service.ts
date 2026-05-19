// src/services/userService.ts
import UserRepository from "../repositories/userRepository";
import { PasswordUtil } from "../utils/passwordUtil";

class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // Get all users
  async getAllUsers(page: number, limit: number) {
    return await this.userRepository.getAllUsers(page, limit);
  }

  // Get user by ID
  async getUserById(id: string) {
    const user = await this.userRepository.getSafeUserById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  // Create user (Admin only) - No tokens generated
  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    // Check if user exists
    const exists = await this.userRepository.userExists(data.email);
    if (exists) {
      throw new Error("User with this email already exists");
    }

    // Validate role
    const validRoles = ["ADMIN", "MANAGER", "DEVELOPER"];
    if (!validRoles.includes(data.role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(data.password);

    // Create user without tokens
    const user = await this.userRepository.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role as any,
    });

    // Return safe user object (no tokens)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  // Update user role
  async updateUserRole(id: string, role: string) {
    const validRoles = ["ADMIN", "MANAGER", "DEVELOPER"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new Error("User not found");
    }

    // If role is being changed to something that needs token invalidation
    const updatedUser = await this.userRepository.updateUser(id, {
      role: role as any,
      // Clear tokens when role changes for security
      accessToken: null,
      refreshToken: null,
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    };
  }

  // Toggle user active status
  async toggleUserStatus(id: string, isActive: boolean) {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new Error("User not found");
    }

    // If deactivating, clear tokens to prevent access
    const updateData: any = { isActive };
    if (!isActive) {
      updateData.accessToken = null;
      updateData.refreshToken = null;
    }

    const updatedUser = await this.userRepository.updateUser(id, updateData);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    };
  }

  // Update profile
  async updateProfile(id: string, data: { name?: string; email?: string }) {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new Error("User not found");
    }

    // If email is being changed, check if new email exists
    if (data.email && data.email !== user.email) {
      const exists = await this.userRepository.userExists(data.email);
      if (exists) {
        throw new Error("Email already in use");
      }
    }

    const updatedUser = await this.userRepository.updateUser(id, data);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    };
  }

  // Change password
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isValid = await PasswordUtil.compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }

    // Validate new password
    const validation = PasswordUtil.validateStrength(newPassword);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }

    // Hash and update new password
    const hashedPassword = await PasswordUtil.hash(newPassword);

    // Clear all tokens for security
    await this.userRepository.updateUser(id, {
      password: hashedPassword,
      accessToken: null,
      refreshToken: null,
    });

    return { message: "Password changed successfully. Please login again." };
  }

  // Delete user
  async deleteUser(id: string) {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new Error("User not found");
    }

    // Prevent deleting yourself
    // You could add this check if you pass the current user's ID
    // if (id === currentUserId) {
    //   throw new Error("You cannot delete your own account");
    // }

    await this.userRepository.deleteUser(id);
    return { message: "User deleted successfully" };
  }

  // Reset user password (Admin function)
  async resetUserPassword(id: string, newPassword: string) {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new Error("User not found");
    }

    // Validate new password
    const validation = PasswordUtil.validateStrength(newPassword);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }

    // Hash new password
    const hashedPassword = await PasswordUtil.hash(newPassword);

    // Clear tokens so user must login with new password
    await this.userRepository.updateUser(id, {
      password: hashedPassword,
      accessToken: null,
      refreshToken: null,
    });

    return { message: "Password reset successfully" };
  }
}

export default UserService;
