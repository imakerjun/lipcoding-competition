/**
 * 애플리케이션 전용 에러 클래스들
 */

export enum ErrorCode {
  // 인증 관련 에러 (1000~1099)
  INVALID_CREDENTIALS = 'AUTH_1001',
  EXPIRED_TOKEN = 'AUTH_1002',
  INVALID_TOKEN = 'AUTH_1003',
  UNAUTHORIZED = 'AUTH_1004',
  FORBIDDEN = 'AUTH_1005',
  EMAIL_ALREADY_EXISTS = 'AUTH_1006',
  
  // 검증 관련 에러 (2000~2099)
  VALIDATION_ERROR = 'VALIDATION_2001',
  MISSING_REQUIRED_FIELD = 'VALIDATION_2002',
  INVALID_FIELD_FORMAT = 'VALIDATION_2003',
  INVALID_ROLE = 'VALIDATION_2004',
  
  // 리소스 관련 에러 (3000~3099)
  RESOURCE_NOT_FOUND = 'RESOURCE_3001',
  USER_NOT_FOUND = 'RESOURCE_3002',
  PROFILE_NOT_FOUND = 'RESOURCE_3003',
  MENTOR_NOT_FOUND = 'RESOURCE_3004',
  
  // 비즈니스 로직 에러 (4000~4099)
  DUPLICATE_MATCH_REQUEST = 'BUSINESS_4001',
  INVALID_MATCH_REQUEST_STATUS = 'BUSINESS_4002',
  SELF_MATCH_REQUEST = 'BUSINESS_4003',
  MENTOR_ALREADY_MATCHED = 'BUSINESS_4004',
  
  // 파일 업로드 관련 에러 (5000~5099)
  FILE_TOO_LARGE = 'FILE_5001',
  INVALID_FILE_TYPE = 'FILE_5002',
  UPLOAD_FAILED = 'FILE_5003',
  
  // 시스템 에러 (9000~9099)
  INTERNAL_SERVER_ERROR = 'SYSTEM_9001',
  DATABASE_ERROR = 'SYSTEM_9002',
  EXTERNAL_SERVICE_ERROR = 'SYSTEM_9003'
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly details?: any;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.details = details;

    // V8 엔진에서 스택 트레이스 캡처
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// 특정 에러 타입들을 위한 팩토리 함수들
export class AuthError extends AppError {
  constructor(code: ErrorCode, message: string, details?: any) {
    let statusCode = 401;
    
    switch (code) {
      case ErrorCode.FORBIDDEN:
        statusCode = 403;
        break;
      case ErrorCode.EMAIL_ALREADY_EXISTS:
        statusCode = 409;
        break;
      default:
        statusCode = 401;
    }
    
    super(code, message, statusCode, true, details);
  }
}

export class ValidationError extends AppError {
  constructor(code: ErrorCode, message: string, details?: any) {
    super(code, message, 400, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(code: ErrorCode, message: string, details?: any) {
    super(code, message, 404, true, details);
  }
}

export class BusinessError extends AppError {
  constructor(code: ErrorCode, message: string, statusCode: number = 409, details?: any) {
    super(code, message, statusCode, true, details);
  }
}

export class FileError extends AppError {
  constructor(code: ErrorCode, message: string, details?: any) {
    let statusCode = 400;
    
    switch (code) {
      case ErrorCode.FILE_TOO_LARGE:
        statusCode = 413;
        break;
      default:
        statusCode = 400;
    }
    
    super(code, message, statusCode, true, details);
  }
}

export class SystemError extends AppError {
  constructor(code: ErrorCode, message: string, details?: any) {
    super(code, message, 500, false, details);
  }
}

// 에러 생성을 위한 헬퍼 함수들
export const createAuthError = {
  invalidCredentials: (details?: any) => 
    new AuthError(ErrorCode.INVALID_CREDENTIALS, 'Invalid email or password', details),
  
  expiredToken: (details?: any) => 
    new AuthError(ErrorCode.EXPIRED_TOKEN, 'Token has expired', details),
  
  invalidToken: (details?: any) => 
    new AuthError(ErrorCode.INVALID_TOKEN, 'Invalid token', details),
  
  unauthorized: (details?: any) => 
    new AuthError(ErrorCode.UNAUTHORIZED, 'Authentication required', details),
  
  forbidden: (details?: any) => 
    new AuthError(ErrorCode.FORBIDDEN, 'Access forbidden', details),
  
  emailAlreadyExists: (email: string) => 
    new AuthError(ErrorCode.EMAIL_ALREADY_EXISTS, 'Email already exists', { email })
};

export const createValidationError = {
  missingField: (field: string) => 
    new ValidationError(ErrorCode.MISSING_REQUIRED_FIELD, `Missing required field: ${field}`, { field }),
  
  invalidFormat: (field: string, expectedFormat: string) => 
    new ValidationError(ErrorCode.INVALID_FIELD_FORMAT, `Invalid format for field: ${field}. Expected: ${expectedFormat}`, { field, expectedFormat }),
  
  invalidRole: (role: string) => 
    new ValidationError(ErrorCode.INVALID_ROLE, 'Role must be either "mentor" or "mentee"', { role }),

  invalidEmail: (email: string) => 
    new ValidationError(ErrorCode.INVALID_FIELD_FORMAT, 'Valid email address is required', { email, field: 'email' }),

  weakPassword: () => 
    new ValidationError(ErrorCode.INVALID_FIELD_FORMAT, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', { field: 'password' }),

  invalidLength: (field: string, limit: number, type: 'minimum' | 'maximum') => 
    new ValidationError(ErrorCode.INVALID_FIELD_FORMAT, `${field} must be ${type === 'minimum' ? 'at least' : 'at most'} ${limit} characters long`, { field, limit, type }),

  invalidValue: (field: string, value: any) => 
    new ValidationError(ErrorCode.INVALID_FIELD_FORMAT, `Invalid value for field: ${field}`, { field, value }),

  invalidNumber: (field: string, value: any) => 
    new ValidationError(ErrorCode.INVALID_FIELD_FORMAT, `${field} must be a valid number`, { field, value }),

  arrayTooLarge: (field: string, maxItems: number) => 
    new ValidationError(ErrorCode.INVALID_FIELD_FORMAT, `${field} cannot have more than ${maxItems} items`, { field, maxItems }),

  generic: (message: string, details?: any) => 
    new ValidationError(ErrorCode.INVALID_FIELD_FORMAT, message, details)
};

export const createNotFoundError = {
  user: (id: number) => 
    new NotFoundError(ErrorCode.USER_NOT_FOUND, `User not found with id: ${id}`, { id }),
  
  profile: (userId: number) => 
    new NotFoundError(ErrorCode.PROFILE_NOT_FOUND, `Profile not found for user: ${userId}`, { userId }),
  
  mentor: (id: number) => 
    new NotFoundError(ErrorCode.MENTOR_NOT_FOUND, `Mentor not found with id: ${id}`, { id })
};
