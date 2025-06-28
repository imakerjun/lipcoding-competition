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
      
      const decoded = await this.jwtService.verifyToken(token);
      req.user = decoded;
      
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
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
