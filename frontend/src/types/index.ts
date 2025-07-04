export interface User {
  id: number;
  email: string;
  role: 'mentor' | 'mentee';
  profile: UserProfile;
}

export interface UserProfile {
  name: string;
  bio: string;
  imageUrl: string;
  skills?: string[];
}

export interface MatchRequest {
  id: number;
  mentorId: number;
  menteeId: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: 'mentor' | 'mentee';
}

export interface UpdateProfileRequest {
  name: string;
  bio: string;
  image?: string;
  skills?: string[];
}

export interface AuthResponse {
  token: string;
}

export interface ApiError {
  status: string;
  statusCode: number;
  message: string;
}
