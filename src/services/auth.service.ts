// src/services/authService.ts
import UserRepository from "../repositories/userRepository";
import { JwtUtil, TokenPayload } from "../utils/jwtUtil";
import { PasswordUtil } from "../utils/passwordUtil";

class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // Self registration - generates tokens
  async register(data: { name: string; email: string; password: string }) {
    // Check if user exists
    const existingUser = await this.userRepository.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Validate password strength
    const passwordValidation = PasswordUtil.validateStrength(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(data.password);

    // Create user with default DEVELOPER role
    const user = await this.userRepository.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "DEVELOPER", // Self-registered users always get DEVELOPER role
    });

    // Generate tokens for immediate login
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = JwtUtil.generateTokens(payload);

    // Store tokens - user is automatically logged in
    await this.userRepository.updateTokens(
      user.id,
      tokens.accessToken,
      tokens.refreshToken,
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  // Login - generates new tokens
  async login(email: string, password: string) {
    // Find user
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("Account is deactivated. Contact administrator.");
    }

    // Verify password
    const isValidPassword = await PasswordUtil.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Generate tokens
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = JwtUtil.generateTokens(payload);

    // Update tokens
    const token = await this.userRepository.updateTokens(
      user.id,
      tokens.accessToken,
      tokens.refreshToken,
    );

    console.log(token);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  // Refresh token - generates new pair
  async refreshAccessToken(refreshToken: string) {
    // Verify refresh token
    const decoded = JwtUtil.verifyRefreshToken(refreshToken);

    // Find user with valid refresh token
    const user = await this.userRepository.getUserByIdWithRefreshToken(
      decoded.userId,
      refreshToken,
    );
    if (!user) {
      throw new Error("Invalid refresh token");
    }

    // Generate new tokens (rotation)
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = JwtUtil.generateTokens(payload);

    // Update tokens
    await this.userRepository.updateTokens(
      user.id,
      tokens.accessToken,
      tokens.refreshToken,
    );

    return tokens;
  }

  // Logout - clears tokens
  async logout(userId: string) {
    await this.userRepository.clearTokens(userId);
  }
}

export default AuthService;
