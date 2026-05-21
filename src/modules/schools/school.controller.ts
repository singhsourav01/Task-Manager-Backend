import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { SchoolService } from "./school.service";
import {
  CreateSchoolSchema,
  UpdateSchoolSchema,
  SchoolQuerySchema,
} from "./school.dto";
import { ApiResponse } from "../../utils/apiResponse";

export class SchoolController {
  static async createSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateSchoolSchema.parse(req.body);
      const school = await SchoolService.createSchool(data);

      ApiResponse.success(res, {
        message: "School created successfully",
        data: school,
        statusCode: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSchools(req: Request, res: Response, next: NextFunction) {
    try {
      const query = SchoolQuerySchema.parse(req.query);
      const result = await SchoolService.getSchools(query);

      ApiResponse.success(res, {
        message: "Schools fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllSchoolsSimple(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const isActive =
        req.query.isActive === "true"
          ? true
          : req.query.isActive === "false"
            ? false
            : undefined;

      const schools = await SchoolService.getAllSchoolsSimple(isActive);

      ApiResponse.success(res, {
        message: "Schools fetched successfully",
        data: schools,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSchoolById(req: Request, res: Response, next: NextFunction) {
    try {
      const school = await SchoolService.getSchoolById(req.params.id);

      ApiResponse.success(res, {
        message: "School fetched successfully",
        data: school,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSchoolBySlug(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const school = await SchoolService.getSchoolBySlug(req.params.slug);

      ApiResponse.success(res, {
        message: "School fetched successfully",
        data: school,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UpdateSchoolSchema.parse(req.body);
      const school = await SchoolService.updateSchool(req.params.id, data);

      ApiResponse.success(res, {
        message: "School updated successfully",
        data: school,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSchool(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SchoolService.deleteSchool(req.params.id);

      ApiResponse.success(res, {
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
