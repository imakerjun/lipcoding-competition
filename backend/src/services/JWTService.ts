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
      jwt.verify(token, this.secretKey, { algorithms: ['HS256'] }, (err, decoded) => {
        if (err) {
          reject(new Error('Invalid token'));
          return;
        }

        const claims = decoded as JWTClaims;
        
        // 토큰 유효성 검사
        const now = Math.floor(Date.now() / 1000);
        if (claims.exp <= now) {
          reject(new Error('Token expired'));
          return;
        }

        if (claims.nbf > now) {
          reject(new Error('Token not yet valid'));
          return;
        }

        if (claims.iss !== this.issuer || claims.aud !== this.audience) {
          reject(new Error('Invalid token issuer or audience'));
          return;
        }

        resolve({
          userId: parseInt(claims.sub),
          email: claims.email,
          role: claims.role,
          name: claims.name
        });
      });
    });
  }
}
