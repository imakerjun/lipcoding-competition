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

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ 
          error: 'Invalid email format' 
        });
        return;
      }

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

      // 입력 검증 - 테스트 요구사항에 따라 401 Unauthorized 반환
      if (!email || !password) {
        res.status(401).json({ 
          error: 'Missing required fields: email and password are required' 
        });
        return;
      }

      const result = await authService.login({ email, password });

      // API 명세에 따른 응답 포맷: { token: "JWT_TOKEN" }
      res.status(200).json({
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default router;
