import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../types';

export interface TokenPayload {
  userId: number;
  email: string;
  role: UserRole;
  name: string;
}

export interface JWTClaims {
  iss: string; // Issuer
  sub: string; // Subject (user ID)
  aud: string; // Audience
  exp: number; // Expiration time
  nbf: number; // Not before
  iat: number; // Issued at
  jti: string; // JWT ID
  name: string;
  email: string;
  role: UserRole;
}

export class JWTService {
  private secretKey: string;
  private issuer: string;
  private audience: string;
  private expiresIn: number; // seconds

  constructor(
    secretKey: string, 
    issuer: string = 'mentor-mentee-app', 
    audience: string = 'mentor-mentee-users',
    expiresIn: number = 3600 // 1시간
  ) {
    this.secretKey = secretKey;
    this.issuer = issuer;
    this.audience = audience;
    this.expiresIn = expiresIn;
  }

  generateToken(payload: TokenPayload): string {
    const now = Math.floor(Date.now() / 1000);

    const claims: JWTClaims = {
      iss: this.issuer,
      sub: payload.userId.toString(),
      aud: this.audience,
      exp: now + this.expiresIn,
      nbf: now,
      iat: now,
      jti: uuidv4(),
      name: payload.name,
      email: payload.email,
      role: payload.role
    };

    return jwt.sign(claims, this.secretKey, { algorithm: 'HS256' });
  }

  verifyToken(token: string): Promise<{ userId: number; email: string; role: UserRole; name: string }> {
    return new Promise((resolve, reject) => {
      try {
        // 토큰 형식 기본 검증
        if (!token || typeof token !== 'string' || token.trim() === '') {
          reject(new Error('Invalid token format'));
          return;
        }

        // 기본적인 JWT 형식 검증 (3개 부분으로 구성되어야 함)
        const parts = token.split('.');
        if (parts.length !== 3) {
          reject(new Error('Malformed token'));
          return;
        }

        // 각 부분이 base64 형식인지 확인
        try {
          parts.forEach(part => {
            if (!part || part.length === 0) {
              throw new Error('Empty token part');
            }
          });
        } catch (err) {
          reject(new Error('Invalid token structure'));
          return;
        }

        jwt.verify(token, this.secretKey, { 
          algorithms: ['HS256'],
          issuer: this.issuer,
          audience: this.audience
        }, (err, decoded) => {
          if (err) {
            // JWT 라이브러리 에러를 더 구체적으로 처리
            if (err.name === 'TokenExpiredError') {
              reject(new Error('Token expired'));
            } else if (err.name === 'JsonWebTokenError') {
              reject(new Error('Invalid token'));
            } else if (err.name === 'NotBeforeError') {
              reject(new Error('Token not yet valid'));
            } else {
              reject(new Error('Token verification failed'));
            }
            return;
          }

          try {
            const claims = decoded as JWTClaims;
            
            // 필수 클레임 검증
            if (!claims.sub || !claims.email || !claims.role || !claims.name) {
              reject(new Error('Invalid token claims'));
              return;
            }

            const userId = parseInt(claims.sub);
            if (isNaN(userId)) {
              reject(new Error('Invalid user ID in token'));
              return;
            }

            resolve({
              userId,
              email: claims.email,
              role: claims.role,
              name: claims.name
            });
          } catch (parseError) {
            reject(new Error('Invalid token format'));
          }
        });
      } catch (outerError) {
        // 최상위 try-catch로 모든 예외 처리
        reject(new Error('Token verification failed'));
      }
    });
  }
}
