// src/utils/jwtUtil.ts
import jwt, { SignOptions } from "jsonwebtoken";
import { jwtConfig } from "../config/jwtConfig";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class JwtUtil {
  // Generate access token
  static generateAccessToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: jwtConfig.accessToken.expiresIn as any, // or cast to number
    };

    return jwt.sign(payload, jwtConfig.accessToken.secret, options);
  }

  // Generate refresh token
  static generateRefreshToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: jwtConfig.refreshToken.expiresIn as any,
    };

    return jwt.sign(payload, jwtConfig.refreshToken.secret, options);
  }

  // Generate both tokens
  static generateTokens(payload: TokenPayload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  // Verify access token
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, jwtConfig.accessToken.secret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Access token has expired");
      }
      throw new Error("Invalid access token");
    }
  }

  // Verify refresh token
  static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, jwtConfig.refreshToken.secret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Refresh token has expired");
      }
      throw new Error("Invalid refresh token");
    }
  }

  // Decode token without verification
  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  }
}
