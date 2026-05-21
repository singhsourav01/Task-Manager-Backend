import { Response } from "express";
import { StatusCodes } from "http-status-codes";

interface ApiResponseData {
  message: string;
  data?: any;
  statusCode?: number;
  meta?: any;
}

interface ApiErrorData {
  message: string;
  statusCode?: number;
  errors?: any;
}

export class ApiResponse {
  static success(
    res: Response,
    { message, data, statusCode = StatusCodes.OK, meta }: ApiResponseData,
  ) {
    const response: any = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
    };

    if (data !== undefined) {
      response.data = data;
    }

    if (meta) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    {
      message,
      statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
      errors,
    }: ApiErrorData,
  ) {
    const response: any = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  static paginated(
    res: Response,
    {
      message,
      data,
      meta,
      statusCode = StatusCodes.OK,
    }: {
      message: string;
      data: any[];
      meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
      statusCode?: number;
    },
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    });
  }

  static created(
    res: Response,
    { message, data }: { message: string; data?: any },
  ) {
    return this.success(res, {
      message,
      data,
      statusCode: StatusCodes.CREATED,
    });
  }

  static noContent(res: Response, { message }: { message: string }) {
    return res.status(StatusCodes.NO_CONTENT).json({
      success: true,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
