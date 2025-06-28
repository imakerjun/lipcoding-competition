import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../services/JWTService';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: 'mentor' | 'mentee';
    name: string;
  };
}

export class AuthMiddleware {
  constructor(private jwtService: JWTService) {}

  authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authorization header required' });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // 빈 토큰 체크
      if (!token || token.trim() === '') {
        res.status(401).json({ error: 'Token required' });
        return;
      }

      try {
        const decoded = await this.jwtService.verifyToken(token);
        req.user = decoded;
        next();
      } catch (jwtError: any) {
        // JWT 검증 실패 시 항상 401 반환
        console.error('JWT verification failed:', jwtError.message);
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }
    } catch (error: any) {
      // 예상치 못한 에러는 500으로 처리하지만 인증 관련은 401로
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  };

  requireRole = (role: 'mentor' | 'mentee') => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (req.user.role !== role) {
        res.status(403).json({ error: `${role} role required` });
        return;
      }

      next();
    };
  };
}
