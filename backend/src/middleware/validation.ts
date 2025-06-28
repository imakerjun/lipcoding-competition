import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createValidationError } from '../errors/AppError';

export class ValidationMiddleware {
  /**
   * Joi 스키마를 사용한 요청 데이터 검증 미들웨어
   */
  validate(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const { error, value } = schema.validate(req.body);

        if (error) {
          // Joi 에러를 우리 커스텀 에러로 변환
          const validationError = this.convertJoiError(error, req.path);
          next(validationError);
          return;
        }

        // 검증된 데이터로 요청 body 교체 (sanitized)
        req.body = value;
        next();
      } catch (err) {
        // 예상치 못한 검증 에러
        const error = createValidationError.generic(
          'Validation processing failed',
          req.path
        );
        next(error);
      }
    };
  }

  /**
   * 쿼리 파라미터 검증용 미들웨어
   */
  validateQuery(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const { error, value } = schema.validate(req.query);

        if (error) {
          const validationError = this.convertJoiError(error, req.path);
          next(validationError);
          return;
        }

        req.query = value;
        next();
      } catch (err) {
        const error = createValidationError.generic(
          'Query validation processing failed',
          req.path
        );
        next(error);
      }
    };
  }

  /**
   * 파라미터 검증용 미들웨어
   */
  validateParams(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const { error, value } = schema.validate(req.params);

        if (error) {
          const validationError = this.convertJoiError(error, req.path);
          next(validationError);
          return;
        }

        req.params = value;
        next();
      } catch (err) {
        const error = createValidationError.generic(
          'Parameter validation processing failed',
          req.path
        );
        next(error);
      }
    };
  }

  /**
   * Joi 검증 에러를 커스텀 검증 에러로 변환
   */
  private convertJoiError(joiError: Joi.ValidationError, path: string) {
    if (!joiError.details || joiError.details.length === 0) {
      return createValidationError.generic('Validation failed', { path });
    }

    const detail = joiError.details[0]!; // 첫 번째 에러만 처리 (위에서 length 체크했으므로 안전)
    const field = detail.path?.join('.') || 'unknown';
    const message = detail.message || 'Validation error';

    // 에러 타입에 따른 적절한 에러 생성
    switch (detail.type) {
      case 'any.required':
        return createValidationError.missingField(field);
      
      case 'string.email':
        return createValidationError.invalidEmail(detail.context?.value || '');
      
      case 'string.min':
      case 'string.max':
        return createValidationError.invalidLength(
          field,
          detail.context?.limit || 0,
          detail.type === 'string.min' ? 'minimum' : 'maximum'
        );
      
      case 'string.pattern.base':
        if (field === 'password') {
          return createValidationError.weakPassword();
        }
        return createValidationError.invalidFormat(field, 'valid format');
      
      case 'any.only':
        if (field === 'role') {
          return createValidationError.invalidRole(detail.context?.value || '');
        }
        return createValidationError.invalidValue(field, detail.context?.value);
      
      case 'number.base':
      case 'number.integer':
      case 'number.positive':
        return createValidationError.invalidNumber(field, detail.context?.value);
      
      case 'array.max':
        return createValidationError.arrayTooLarge(
          field,
          detail.context?.limit || 0
        );
      
      default:
        return createValidationError.generic(message, { field, value: detail.context?.value, path });
    }
  }
}

// 싱글톤 인스턴스
export const validationMiddleware = new ValidationMiddleware();
