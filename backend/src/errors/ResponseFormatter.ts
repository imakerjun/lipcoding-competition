import { AppError, ErrorCode } from './AppError';

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    timestamp: string;
    path?: string;
    details?: any;
    stack?: string;
  };
  requestId?: string;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export class ResponseFormatter {
  static success<T>(data: T, message?: string): SuccessResponse<T> {
    const response: SuccessResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
    
    if (message) {
      response.message = message;
    }
    
    return response;
  }

  static error(
    error: AppError | Error,
    path?: string,
    requestId?: string,
    includeStack: boolean = false
  ): ErrorResponse {
    if (error instanceof AppError) {
      const response: ErrorResponse = {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp: error.timestamp.toISOString()
        }
      };
      
      if (path) response.error.path = path;
      if (error.details) response.error.details = error.details;
      if (includeStack && error.stack) response.error.stack = error.stack;
      if (requestId) response.requestId = requestId;
      
      return response;
    }

    // 일반 Error 객체인 경우
    const response: ErrorResponse = {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      }
    };
    
    if (path) response.error.path = path;
    if (includeStack && error.stack) response.error.stack = error.stack;
    if (requestId) response.requestId = requestId;
    
    return response;
  }

  static validationError(
    field: string,
    message: string,
    path?: string,
    requestId?: string
  ): ErrorResponse {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: `Validation failed for field: ${field}`,
        timestamp: new Date().toISOString(),
        details: { field, validationMessage: message }
      }
    };
    
    if (path) response.error.path = path;
    if (requestId) response.requestId = requestId;
    
    return response;
  }
}
