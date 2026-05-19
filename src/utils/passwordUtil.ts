// src/utils/passwordUtil.ts
import bcrypt from "bcryptjs";

export class PasswordUtil {
  private static readonly SALT_ROUNDS = 12;

  static async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  static async compare(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static validateStrength(password: string): {
    isValid: boolean;
    message: string;
  } {
    if (password.length < 8) {
      return {
        isValid: false,
        message: "Password must be at least 8 characters",
      };
    }
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain an uppercase letter",
      };
    }
    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain a lowercase letter",
      };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: "Password must contain a number" };
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain a special character",
      };
    }
    return { isValid: true, message: "Password is strong" };
  }
}
