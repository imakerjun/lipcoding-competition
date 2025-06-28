export interface User {
  id: number;
  email: string;
  password: string;
  role: 'mentor' | 'mentee';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: number;
  userId: number;
  name: string;
  bio: string;
  imageData?: Buffer;
  imageType?: string;
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
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
  name: string;
  email: string;
  role: 'mentor' | 'mentee';
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: 'mentor' | 'mentee';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name: string;
  bio: string;
  image?: string; // Base64 encoded string
  skills?: string[];
}
