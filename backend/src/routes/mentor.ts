import { Router, Request, Response, NextFunction } from 'express';
import { ResponseFormatter } from '../errors/ResponseFormatter';
import { AppError, ErrorCode } from '../errors/AppError';
import { DIContainer } from '../container/DIContainer';
import { getContainer } from '../database';

const router = Router();

// 간단한 인증 미들웨어 - 401 상태 코드 직접 반환
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const container = getContainer();
    const jwtService = container.get('jwtService');
    
    try {
      const decoded = await jwtService.verifyToken(token);
      (req as any).user = decoded;
      next();
    } catch (jwtError: any) {
      // JWT 검증 실패 시 401 반환
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  } catch (error) {
    // 예상치 못한 에러는 500으로 처리
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// 멘토 목록 조회 (인증 필요)
router.get('/mentors', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const container = getContainer();
    const mentorService = container.get('mentorService');

    // 쿼리 파라미터 추출
    const skill = req.query.skill as string | undefined;
    const orderBy = req.query.order_by as 'name' | 'skill' | 'id' | undefined;

    // 옵션 객체 생성 (undefined 값 제거)
    const options: any = {};
    if (skill) options.skill = skill;
    if (orderBy) options.orderBy = orderBy;
    else options.orderBy = 'id';

    // 멘토 목록 조회
    const mentors = await mentorService.getAllMentors(options);

    // 응답 형식 변환 - API 명세에 따라 직접 배열 반환
    const responseData = mentors.map(mentor => ({
      id: mentor.id,
      email: mentor.email,
      role: "mentor",
      profile: {
        name: mentor.name || '',
        bio: mentor.bio || '',
        imageUrl: mentor.profileImage ? `/images/mentor/${mentor.id}` : `https://placehold.co/500x500.jpg?text=MENTOR`,
        skills: mentor.skillsets || []
      }
    }));

    // API 명세에 따라 배열 직접 반환 (ResponseFormatter 사용하지 않음)
    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
});

export default router;
