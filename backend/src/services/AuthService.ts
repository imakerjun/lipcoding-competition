import bcrypt from 'bcrypt';
import { UserModel } from '../models/User';
import { UserProfileModel } from '../models/UserProfile';
import { JWTService } from './JWTService';
import { User, UserRole, UserProfile } from '../types';
import { createAuthError, createNotFoundError } from '../errors/AppError';

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  user: User;
  profile: UserProfile;
  token: string;
}

export class AuthService {
  private userModel: UserModel;
  private userProfileModel: UserProfileModel;
  private jwtService: JWTService;
  private bcryptRounds: number;

  constructor(
    userModel: UserModel, 
    userProfileModel: UserProfileModel, 
    jwtService: JWTService,
    bcryptRounds: number = 10
  ) {
    this.userModel = userModel;
    this.userProfileModel = userProfileModel;
    this.jwtService = jwtService;
    this.bcryptRounds = bcryptRounds;
  }

  async signup(request: SignupRequest): Promise<AuthenticatedUser> {
    const { email, password, name, role } = request;

    // 이메일 중복 확인
    const existingUser = await this.userModel.findByEmail(email);
    if (existingUser) {
      throw createAuthError.emailAlreadyExists(email);
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, this.bcryptRounds);

    // 사용자 생성
    const user = await this.userModel.create({
      email,
      password: hashedPassword,
      role
    });

    // 프로필 생성
    const profile = await this.userProfileModel.create({
      userId: user.id,
      name,
      bio: ''
    });

    // JWT 토큰 생성
    const token = this.jwtService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: profile.name
    });

    return {
      user,
      profile,
      token
    };
  }

  async login(request: LoginRequest): Promise<AuthenticatedUser> {
    const { email, password } = request;

    // 사용자 조회
    const user = await this.userModel.findByEmail(email);
    if (!user) {
      throw createAuthError.invalidCredentials();
    }

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw createAuthError.invalidCredentials();
    }

    // 프로필 조회
    const profile = await this.userProfileModel.findByUserId(user.id);
    if (!profile) {
      throw createNotFoundError.profile(user.id);
    }

    // JWT 토큰 생성
    const token = this.jwtService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: profile.name
    });

    return {
      user,
      profile,
      token
    };
  }

  async verifyToken(token: string): Promise<{ userId: number; email: string; role: UserRole; name: string }> {
    return this.jwtService.verifyToken(token);
  }
}
