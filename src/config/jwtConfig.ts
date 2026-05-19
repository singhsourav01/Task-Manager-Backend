// src/config/jwt.config.ts
export const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET || "fallback-access-secret",
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret",
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  },
};
