import { Router, Request, Response, NextFunction } from 'express';
import { DIContainer } from '../container/DIContainer';
import { IMatchRequestService } from '../services/IMatchRequestService';
import { ResponseFormatter } from '../errors/ResponseFormatter';
import { AppError, ErrorCode } from '../errors/AppError';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: 'mentor' | 'mentee';
    name: string;
  };
}

// 간단한 인증 미들웨어 - 401 상태 코드 직접 반환
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const container = (req as any).container;
    const jwtService = container.get('jwtService');

    try {
      const payload = await jwtService.verifyToken(token);
      (req as any).user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        name: payload.name
      };
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

export function createMatchRequestRoutes(container: DIContainer): Router {
  const router = Router();
  const matchRequestService = container.get('matchRequestService') as IMatchRequestService;
  
  // 컨테이너를 req에 첨부하는 미들웨어
  router.use((req: Request, res: Response, next: NextFunction) => {
    (req as any).container = container;
    next();
  });

  // 매칭 요청 생성
  router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { mentorId, message } = req.body;
      const menteeId = (req as AuthenticatedRequest).user!.userId;

      const request = await matchRequestService.createMatchRequest({
        mentorId,
        menteeId,
        message
      });

      // API 명세에 따른 응답 포맷
      res.status(200).json({
        id: request.id,
        mentorId: request.mentorId,
        menteeId: request.menteeId,
        message: request.message,
        status: request.status
      });
    } catch (error: any) {
      next(error);
    }
  });

  // 받은 요청 목록 조회 (멘토용)
  router.get('/incoming', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user!.userId;
      const requests = await matchRequestService.getIncomingRequests(userId);

      // API 명세에 따른 배열 응답 포맷
      res.status(200).json(requests);
    } catch (error: any) {
      next(error);
    }
  });

  // 보낸 요청 목록 조회 (멘티용)
  router.get('/outgoing', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user!.userId;
      const requests = await matchRequestService.getOutgoingRequests(userId);

      // API 명세에 따른 배열 응답 포맷
      res.status(200).json(requests);
    } catch (error: any) {
      next(error);
    }
  });  // 요청 수락
  router.put('/:id/accept', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = parseInt(req.params.id!);
      const userId = (req as AuthenticatedRequest).user!.userId;

      const result = await matchRequestService.acceptRequest(requestId, userId);

      // API 명세에 따른 응답 포맷
      res.status(200).json({
        id: result.id,
        mentorId: result.mentorId,
        menteeId: result.menteeId,
        message: result.message,
        status: result.status
      });
    } catch (error: any) {
      next(error);
    }
  });

  // 요청 거절
  router.put('/:id/reject', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = parseInt(req.params.id!);
      const userId = (req as AuthenticatedRequest).user!.userId;
      
      const result = await matchRequestService.rejectRequest(requestId, userId);
      
      // API 명세에 따른 응답 포맷
      res.status(200).json({
        id: result.id,
        mentorId: result.mentorId,
        menteeId: result.menteeId,
        message: result.message,
        status: result.status
      });
    } catch (error: any) {
      next(error);
    }
  });

  // 요청 취소
  router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = parseInt(req.params.id!);
      const userId = (req as AuthenticatedRequest).user!.userId;
      
      const result = await matchRequestService.cancelRequest(requestId, userId);
      
      // API 명세에 따른 응답 포맷
      res.status(200).json({
        id: result.id,
        mentorId: result.mentorId,
        menteeId: result.menteeId,
        message: result.message,
        status: result.status
      });
    } catch (error: any) {
      next(error);
    }
  });

  return router;
}
