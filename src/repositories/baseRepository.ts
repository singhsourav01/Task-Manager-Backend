// src/repositories/baseRepository.ts
import { PrismaClient } from "@prisma/client";

export class BaseRepository {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Common utility methods
  protected async executeQuery<T>(query: Promise<T>): Promise<T> {
    try {
      return await query;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }
}
