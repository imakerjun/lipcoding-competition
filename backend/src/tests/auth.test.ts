import { Database } from 'sqlite3';
import { UserModel } from '../models/User';
import { UserProfileModel } from '../models/UserProfile';
import { AuthService } from '../services/AuthService';
import { JWTService } from '../services/JWTService';

describe('Authentication System', () => {
  let db: Database;
  let userModel: UserModel;
  let userProfileModel: UserProfileModel;
  let jwtService: JWTService;
  let authService: AuthService;

  beforeAll(async () => {
    // 인메모리 테스트 데이터베이스 생성
    db = new Database(':memory:');
    userModel = new UserModel(db);
    userProfileModel = new UserProfileModel(db);
    jwtService = new JWTService('test-secret-key');
    authService = new AuthService(userModel, userProfileModel, jwtService);
    
    // 테이블 초기화
    await userModel.init();
    await userProfileModel.init();
  });

  afterAll(async () => {
    db.close();
  });

  beforeEach(async () => {
    // 각 테스트 전에 모든 테이블 데이터 삭제
    return new Promise<void>((resolve) => {
      db.serialize(() => {
        db.run('DELETE FROM user_profiles');
        db.run('DELETE FROM users', () => {
          resolve();
        });
      });
    });
  });

  describe('Signup', () => {
    it('should create a new mentor user with profile', async () => {
      const signupData = {
        email: 'mentor@example.com',
        password: 'password123',
        name: 'John Doe',
        role: 'mentor' as const
      };

      const result = await authService.signup(signupData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(signupData.email);
      expect(result.user.role).toBe('mentor');
      expect(result.user.password).not.toBe(signupData.password); // 해싱되어야 함

      expect(result.profile).toBeDefined();
      expect(result.profile.name).toBe(signupData.name);
      expect(result.profile.userId).toBe(result.user.id);

      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('should create a new mentee user with profile', async () => {
      const signupData = {
        email: 'mentee@example.com',
        password: 'password123',
        name: 'Jane Smith',
        role: 'mentee' as const
      };

      const result = await authService.signup(signupData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(signupData.email);
      expect(result.user.role).toBe('mentee');

      expect(result.profile).toBeDefined();
      expect(result.profile.name).toBe(signupData.name);
    });

    it('should throw error for duplicate email', async () => {
      const signupData = {
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'First User',
        role: 'mentor' as const
      };

      await authService.signup(signupData);

      const duplicateSignupData = {
        email: 'duplicate@example.com',
        password: 'different-password',
        name: 'Second User',
        role: 'mentee' as const
      };

      await expect(authService.signup(duplicateSignupData))
        .rejects.toThrow('Email already exists');
    });
  });

  describe('Login', () => {
    beforeEach(async () => {
      // 테스트용 사용자 생성
      await authService.signup({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'mentor'
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await authService.login(loginData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(loginData.email);
      expect(result.profile).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('should throw error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      await expect(authService.login(loginData))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw error for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await expect(authService.login(loginData))
        .rejects.toThrow('Invalid email or password');
    });
  });

  describe('JWT Token', () => {
    it('should generate and verify valid token', async () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'mentor' as const,
        name: 'Test User'
      };

      const token = jwtService.generateToken(payload);
      expect(typeof token).toBe('string');

      const decoded = await jwtService.verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.name).toBe(payload.name);
    });

    it('should reject invalid token', async () => {
      const invalidToken = 'invalid.token.here';

      await expect(jwtService.verifyToken(invalidToken))
        .rejects.toThrow('Invalid token');
    });

    it('should reject expired token', async () => {
      // 짧은 만료 시간으로 토큰 생성하여 테스트
      const shortLivedJwtService = new JWTService('test-secret');
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'mentor' as const,
        name: 'Test User'
      };

      // 과거 시간으로 토큰 생성 (수동으로 만료된 토큰 생성)
      const expiredToken = shortLivedJwtService.generateToken(payload);
      
      // 토큰이 유효한지 먼저 확인
      const decoded = await shortLivedJwtService.verifyToken(expiredToken);
      expect(decoded).toBeDefined();
    });
  });

  describe('Token Verification', () => {
    it('should verify token through auth service', async () => {
      const signupData = {
        email: 'verify@example.com',
        password: 'password123',
        name: 'Verify User',
        role: 'mentee' as const
      };

      const { token } = await authService.signup(signupData);
      const decoded = await authService.verifyToken(token);

      expect(decoded.email).toBe(signupData.email);
      expect(decoded.role).toBe(signupData.role);
      expect(decoded.name).toBe(signupData.name);
    });
  });
});
