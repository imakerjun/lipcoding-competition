import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types'; // Corrected import path
import { AuthError, ErrorCode } from '../errors/AppError';
import { JWTService } from '../services/JWTService';

declare global {
    namespace Express {
        interface Request {
            user?: { id: number; role: UserRole };
        }
    }
}

// Middleware factory to inject JWTService dependency
export const createAuthMiddleware = (jwtService: JWTService) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                // Use AuthError for consistency
                throw new AuthError(ErrorCode.UNAUTHORIZED, 'Authorization header is missing or malformed');
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwtService.verifyToken(token);

            req.user = { id: decoded.id, role: decoded.role };
            next();
        } catch (error) {
            // Catch all errors from JWT verification and ensure a 401 response
            next(new AuthError(ErrorCode.INVALID_TOKEN, 'Invalid or expired token.'));
        }
    };
};

export const authorize = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            // This case should ideally be handled by the authentication middleware first
            return next(new AuthError(ErrorCode.UNAUTHORIZED, 'Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            // Use AuthError for forbidden access
            return next(new AuthError(ErrorCode.FORBIDDEN, 'You do not have permission to access this resource.'));
        }

        next();
    };
};
