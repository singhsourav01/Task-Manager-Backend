import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import UserRepository from "../repositories/user.repository";
import { API_ERRORS } from "../constants/app.constants";

interface SignupPayload {
  email: string;
  password: string;
  name?: string;
}

class UserService {
  userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async signup(payload: SignupPayload) {
    const { email, password, name } = payload;

    const existingUser = await this.userRepository.getUserByEmail(email);
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, API_ERRORS.SIGN_UP);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.createUser({
      email,
      password: hashedPassword,
      name,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}

export default UserService;