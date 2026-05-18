import express from "express";
import { body } from "express-validator";
import { API_ENDPOINTS } from "../constants/app.constants";
import UserController from "../controller/user.controller";

const UserRoutes = express.Router();
const userController = new UserController();

UserRoutes.route(API_ENDPOINTS.SIGNUP).post(
  body("email").isEmail().withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name").optional().isString(),
  userController.signup
);

export default UserRoutes;
