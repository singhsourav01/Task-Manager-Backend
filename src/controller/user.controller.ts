import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { body, validationResult } from "express-validator";
import UserService from "../services/user.service";
import { API_RESPONSES } from "../constants/app.constants";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

class UserController {
  userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  signup = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(new ApiResponse(StatusCodes.BAD_REQUEST, {}, errors.array()[0].msg));
    }

    const { email, password, name } = req.body;
    const user = await this.userService.signup({ email, password, name });

    return res
      .status(StatusCodes.CREATED)
      .json(new ApiResponse(StatusCodes.CREATED, user, API_RESPONSES.SIGN_UP));
  });
}

export default UserController;
