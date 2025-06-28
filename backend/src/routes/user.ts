import { Router, Request, Response, NextFunction } from 'express';
import { getContainer } from '../database';
import { ResponseFormatter } from '../errors/ResponseFormatter';
import { AppError, ErrorCode } from '../errors/AppError';

const router = Router();

// 간단한 인증 미들웨어 (임시)
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'No token provided', 401);
    }

    const token = authHeader.substring(7);
    const container = getContainer();
    const jwtService = container.get('jwtService');

    const payload = await jwtService.verifyToken(token);
    (req as any).user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      name: payload.name
    };

    next();
  } catch (error) {
    next(error);
  }
};

// GET /me - 내 정보 조회
router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const container = getContainer();
    const userProfileService = container.get('userProfileService');

    const profile = await userProfileService.getUserProfile(userId);
    
    // API 명세에 따른 응답 포맷으로 직접 반환
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
});

// PUT /profile - 프로필 수정
router.put('/profile', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const updateData = req.body;
    
    const container = getContainer();
    const userProfileService = container.get('userProfileService');

    const updatedProfile = await userProfileService.updateUserProfile(userId, updateData);
    
    // API 명세에 따른 응답 포맷으로 직접 반환
    res.status(200).json(updatedProfile);
  } catch (error) {
    next(error);
  }
});

// GET /images/:role/:id - 프로필 이미지
router.get('/images/:role/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, id } = req.params;
    
    if (!role || !id) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Missing role or id parameter', 400);
    }

    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid user ID', 400);
    }

    if (!['mentor', 'mentee'].includes(role)) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid role', 400);
    }

    const container = getContainer();
    const userProfileService = container.get('userProfileService');

    const imageResult = await userProfileService.getUserImage(userId, role as 'mentor' | 'mentee');

    if (imageResult.isDefault) {
      // 기본 이미지 URL로 리다이렉트
      res.redirect(imageResult.url!);
    } else {
      // 커스텀 이미지 반환
      res.set('Content-Type', imageResult.mimeType!);
      res.send(imageResult.data);
    }
  } catch (error) {
    next(error);
  }
});

export default router;
