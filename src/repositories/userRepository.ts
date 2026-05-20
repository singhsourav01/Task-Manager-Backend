// src/repositories/userRepository.ts
import prisma from "../config/prisma.config";
import { Prisma, Role } from "@prisma/client";
interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  isActive?: boolean;
  accessToken?: string | null;
  refreshToken?: string | null;
}

interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class UserRepository {
  // Create user
  async createUser(data: CreateUserData) {
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || "DEVELOPER",
        isActive: true,
      },
    });
  }

  // Get user by email
  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  // Get user by ID
  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  // Get user by ID with refresh token
  async getUserByIdWithRefreshToken(id: string, refreshToken: string) {
    return await prisma.user.findFirst({
      where: {
        id,
        refreshToken,
        isActive: true,
      },
    });
  }

  // Get all users (admin - returns safe data without sensitive fields)
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: SafeUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.user.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,

      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getAllActiveUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: SafeUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { isActive: true },
        skip,
        take: limit,

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.user.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,

      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // Get safe user by ID (without sensitive fields)
  async getSafeUserById(id: string): Promise<SafeUser | null> {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Update user
  async updateUser(id: string, data: UpdateUserData) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  // Update tokens
  async updateTokens(
    id: string,
    accessToken: string | null,
    refreshToken: string | null,
  ) {
    console.log("Updating tokens for user ID:", id);
    console.log("New access token:", accessToken);
    console.log("New refresh token:", refreshToken);
    return await prisma.user.update({
      where: { id },
      data: {
        accessToken,
        refreshToken,
      },
    });
  }

  // Clear tokens (for logout)
  async clearTokens(id: string) {
    return await prisma.user.update({
      where: { id },
      data: {
        accessToken: null,
        refreshToken: null,
      },
    });
  }

  // Delete user
  async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  // Check if user exists by email
  async userExists(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  // Get user count by role
  async getUserCountByRole(role: Role): Promise<number> {
    return await prisma.user.count({
      where: { role },
    });
  }

  // Get active users count
  async getActiveUserCount(): Promise<number> {
    return await prisma.user.count({
      where: { isActive: true },
    });
  }
}

export default UserRepository;
