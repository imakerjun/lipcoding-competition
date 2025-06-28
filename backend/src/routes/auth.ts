import { Router, Request, Response, NextFunction } from 'express';
import { DIContainer } from '../container/DIContainer';
import { createValidationError } from '../errors/AppError';
import { ResponseFormatter } from '../errors/ResponseFormatter';

const router = Router();

// DI 컨테이너를 사용한 팩토리 함수
export const createAuthRouter = (container: DIContainer): Router => {
  const authService = container.get('authService');

  router.post('/signup', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name, role } = req.body;

      // 입력 검증
      if (!email) throw createValidationError.missingField('email');
      if (!password) throw createValidationError.missingField('password');
      if (!name) throw createValidationError.missingField('name');
      if (!role) throw createValidationError.missingField('role');

      if (role !== 'mentor' && role !== 'mentee') {
        throw createValidationError.invalidRole(role);
      }

      const result = await authService.signup({ email, password, name, role });

      const response = ResponseFormatter.success({
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role
        },
        profile: {
          id: result.profile.id,
          name: result.profile.name,
          bio: result.profile.bio
        },
        token: result.token
      }, 'User created successfully');

      res.status(201).json(response);
    } catch (error) {
      // 에러는 글로벌 에러 핸들러에서 처리
      next(error);
    }
  });

  router.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // 입력 검증 - 로그인 실패로 간주하여 401 반환
      if (!email || !password) {
        res.status(401).json({ 
          error: 'Missing required fields: email, password' 
        });
        return;
      }

      const result = await authService.login({ email, password });

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role
        },
        profile: {
          id: result.profile.id,
          name: result.profile.name,
          bio: result.profile.bio
        },
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default router;
