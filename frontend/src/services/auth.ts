import { apiClient, ApiResponse } from './api';

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

export interface User {
  id: number;
  email: string;
  role: 'mentor' | 'mentee';
}

export interface UserProfile {
  id: number;
  name: string;
  bio: string;
}

export interface AuthResponse {
  user: User;
  profile: UserProfile;
  token: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

class AuthService {
  private tokenKey = 'token';
  private userKey = 'user';

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/signup', data);
    
    // 토큰과 사용자 정보 저장
    this.setToken(response.data.token);
    this.setUser(response.data.user);
    
    return response.data;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/login', data);
    
    // 토큰과 사용자 정보 저장
    this.setToken(response.data.token);
    this.setUser(response.data.user);
    
    return response.data;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.tokenKey, token);
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): 'mentor' | 'mentee' | null {
    const user = this.getUser();
    return user?.role || null;
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      // /me 엔드포인트가 있다면 사용, 없으면 로컬 스토리지에서 반환
      const user = this.getUser();
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
