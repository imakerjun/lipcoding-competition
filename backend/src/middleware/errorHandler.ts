import { Request, Response, NextFunction } from 'express';
import { AppError as CustomAppError, ErrorCode, SystemError } from '../errors/AppError';
import { ResponseFormatter } from '../errors/ResponseFormatter';
import { v4 as uuidv4 } from 'uuid';

// 이전 호환성을 위한 인터페이스
export interface LegacyAppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export const createError = (message: string, statusCode: number = 500): LegacyAppError => {
  const error = new Error(message) as any;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error as LegacyAppError;
};

// 요청 ID 생성 미들웨어
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = uuidv4();
  req.headers['x-request-id'] = requestId;
  res.set('X-Request-ID', requestId);
  next();
};

// 글로벌 에러 핸들러
export const errorHandler = (
  error: CustomAppError | LegacyAppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 이미 응답이 전송된 경우 기본 Express 에러 핸들러에 위임
  if (res.headersSent) {
    next(error);
    return;
  }

  const requestId = req.headers['x-request-id'] as string;
  const path = req.originalUrl;
  const isDevelopment = process.env.NODE_ENV === 'development';

  // CustomAppError 인스턴스인 경우
  if (error instanceof CustomAppError) {
    // 운영 가능한 에러인 경우 로그 레벨을 낮춤
    if (error.isOperational) {
      console.warn(`[${error.code}] ${error.message}`, {
        requestId,
        path,
        statusCode: error.statusCode,
        details: error.details
      });
    } else {
      // 시스템 에러인 경우 상세 로그
      console.error(`[${error.code}] ${error.message}`, {
        requestId,
        path,
        statusCode: error.statusCode,
        stack: error.stack,
        details: error.details
      });
    }

    const errorResponse = ResponseFormatter.error(
      error,
      path,
      requestId,
      isDevelopment && !error.isOperational
    );

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // 이전 호환성을 위한 처리 (기존 AppError 인터페이스)
  if ('statusCode' in error && 'isOperational' in error) {
    const legacyError = error as LegacyAppError;
    console.error('Legacy Error:', legacyError);
    
    res.status(legacyError.statusCode).json({
      status: 'error',
      statusCode: legacyError.statusCode,
      message: legacyError.statusCode === 500 ? 'Internal server error' : legacyError.message,
    });
    return;
  }

  // 일반 Error 객체 처리
  console.error('Unhandled Error:', {
    message: error.message,
    stack: error.stack,
    requestId,
    path
  });

  // 시스템 에러로 래핑
  const systemError = new SystemError(
    ErrorCode.INTERNAL_SERVER_ERROR,
    isDevelopment ? error.message : 'Internal server error',
    { originalError: error.message }
  );

  const errorResponse = ResponseFormatter.error(
    systemError,
    path,
    requestId,
    isDevelopment
  );

  res.status(500).json(errorResponse);
};

// 404 핸들러
export const notFoundHandler = (req: Request, res: Response): void => {
  const requestId = req.headers['x-request-id'] as string;
  const path = req.originalUrl;
  
  const notFoundError = new CustomAppError(
    ErrorCode.RESOURCE_NOT_FOUND,
    `Route not found: ${req.method} ${path}`,
    404,
    true,
    { method: req.method, path }
  );

  const errorResponse = ResponseFormatter.error(notFoundError, path, requestId);
  res.status(404).json(errorResponse);
};

// 처리되지 않은 Promise rejection 핸들러
export const setupGlobalErrorHandlers = (): void => {
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // CI 환경에서는 서버를 계속 유지
    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_PATH !== ':memory:') {
      // 실제 프로덕션에서만 종료
      process.exit(1);
    } else {
      console.warn('⚠️  Unhandled rejection caught, but server continues running in development/CI mode');
    }
  });

  process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    // CI 환경에서는 서버를 계속 유지
    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_PATH !== ':memory:') {
      // 실제 프로덕션에서만 종료
      process.exit(1);
    } else {
      console.warn('⚠️  Uncaught exception caught, but server continues running in development/CI mode');
    }
  });
};
