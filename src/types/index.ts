export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'mentor' | 'mentee';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: number;
  userId: number;
  name: string;
  bio: string;
  imageUrl: string;
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchRequest {
  id: number;
  mentorId: number;
  menteeId: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  iss: string; // issuer
  sub: string; // subject (user id)
  aud: string; // audience
  exp: number; // expiration time
  nbf: number; // not before
  iat: number; // issued at
  jti: string; // JWT ID
  name: string;
  email: string;
  role: 'mentor' | 'mentee';
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: 'mentor' | 'mentee';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ProfileUpdateRequest {
  id: number;
  name: string;
  role: 'mentor' | 'mentee';
  bio: string;
  image?: string; // base64 encoded
  skills?: string[];
}

export interface MatchRequestCreate {
  mentorId: number;
  menteeId: number;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface MentorQuery extends PaginationQuery {
  skill?: string;
}

export interface DatabaseConfig {
  filename: string;
}

export interface AppConfig {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  database: DatabaseConfig;
} 