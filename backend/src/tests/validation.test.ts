import { Request, Response, NextFunction } from 'express';
import { ValidationMiddleware } from '../middleware/validation';
import { SignupSchema, LoginSchema } from '../schemas/authSchemas';

// 테스트용 Request/Response 목킹
const createMockRequest = (body: any): Partial<Request> => ({
  body,
  headers: {},
  params: {},
  query: {}
});

const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createMockNext = (): NextFunction => jest.fn();

describe('Validation Middleware', () => {
  let validationMiddleware: ValidationMiddleware;

  beforeEach(() => {
    validationMiddleware = new ValidationMiddleware();
  });

  describe('Signup Validation', () => {
    it('should pass valid signup data', () => {
      const req = createMockRequest({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'John Doe',
        role: 'mentor'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = validationMiddleware.validate(SignupSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject invalid email format', () => {
      const req = createMockRequest({
        email: 'invalid-email',
        password: 'Password123!',
        name: 'John Doe',
        role: 'mentor'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = validationMiddleware.validate(SignupSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.any(String),
          message: expect.stringContaining('email')
        })
      );
    });

    it('should reject weak password', () => {
      const req = createMockRequest({
        email: 'test@example.com',
        password: '123',
        name: 'John Doe',
        role: 'mentor'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = validationMiddleware.validate(SignupSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('password')
        })
      );
    });

    it('should reject empty name', () => {
      const req = createMockRequest({
        email: 'test@example.com',
        password: 'Password123!',
        name: '',
        role: 'mentor'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = validationMiddleware.validate(SignupSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.any(String),
          message: expect.stringContaining('Name')
        })
      );
    });

    it('should reject invalid role', () => {
      const req = createMockRequest({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'John Doe',
        role: 'admin'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = validationMiddleware.validate(SignupSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.any(String),
          message: expect.stringContaining('mentor')
        })
      );
    });

    it('should reject missing required fields', () => {
      const req = createMockRequest({
        email: 'test@example.com'
        // missing password, name, role
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = validationMiddleware.validate(SignupSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.any(String)
        })
      );
    });
  });

  describe('Login Validation', () => {
    it('should pass valid login data', () => {
      const req = createMockRequest({
        email: 'test@example.com',
        password: 'Password123!'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = validationMiddleware.validate(LoginSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject invalid email in login', () => {
      const req = createMockRequest({
        email: 'invalid-email',
        password: 'Password123!'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = validationMiddleware.validate(LoginSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.stringContaining('VALIDATION'),
          message: expect.stringContaining('email')
        })
      );
    });

    it('should reject empty password in login', () => {
      const req = createMockRequest({
        email: 'test@example.com',
        password: ''
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = validationMiddleware.validate(LoginSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.any(String),
          message: expect.stringContaining('Password')
        })
      );
    });
  });

  describe('Schema Validation', () => {
    it('should handle unknown fields gracefully', () => {
      const req = createMockRequest({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'John Doe',
        role: 'mentor',
        unknownField: 'should be ignored'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = validationMiddleware.validate(SignupSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body).not.toHaveProperty('unknownField');
    });

    it('should sanitize and normalize data', () => {
      const req = createMockRequest({
        email: '  TEST@EXAMPLE.COM  ',
        password: 'Password123!',
        name: '  John Doe  ',
        role: 'mentor'
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = validationMiddleware.validate(SignupSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body.email).toBe('test@example.com');
      expect(req.body.name).toBe('John Doe');
    });
  });
});
