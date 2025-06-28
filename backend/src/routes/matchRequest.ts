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

// 간단한 인증 미들웨어 (기존 user.ts와 동일한 패턴)
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'No token provided', 401);
    }

    const token = authHeader.substring(7);
    const container = (req as any).container;
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

      const response = ResponseFormatter.success(request, '매칭 요청이 생성되었습니다.');
      res.status(201).json(response);
    } catch (error: any) {
      next(error);
    }
  });

  // 받은 요청 목록 조회 (멘토용)
  router.get('/incoming', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user!.userId;
      const requests = await matchRequestService.getIncomingRequests(userId);

      const response = ResponseFormatter.success(requests, '받은 요청 목록을 조회했습니다.');
      res.json(response);
    } catch (error: any) {
      next(error);
    }
  });

  // 보낸 요청 목록 조회 (멘티용)
  router.get('/outgoing', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).user!.userId;
      const requests = await matchRequestService.getOutgoingRequests(userId);

      const response = ResponseFormatter.success(requests, '보낸 요청 목록을 조회했습니다.');
      res.json(response);
    } catch (error: any) {
      next(error);
    }
  });  // 요청 수락
  router.put('/:id/accept', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = parseInt(req.params.id!);
      const userId = (req as AuthenticatedRequest).user!.userId;

      const result = await matchRequestService.acceptRequest(requestId, userId);

      const response = ResponseFormatter.success({ accepted: result }, '요청을 수락했습니다.');
      res.json(response);
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
      
      const response = ResponseFormatter.success({ rejected: result }, '요청을 거절했습니다.');
      res.json(response);
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
      
      const response = ResponseFormatter.success({ cancelled: result }, '요청을 취소했습니다.');
      res.json(response);
    } catch (error: any) {
      next(error);
    }
  });

  return router;
}
