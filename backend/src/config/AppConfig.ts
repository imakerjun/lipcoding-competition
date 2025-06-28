import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

export class AppConfig {
  // 서버 설정
  public readonly port: number;
  public readonly nodeEnv: string;
  
  // 데이터베이스 설정
  public readonly databasePath: string;
  
  // JWT 설정
  public readonly jwtSecret: string;
  public readonly jwtExpiresIn: string;
  public readonly jwtIssuer: string;
  public readonly jwtAudience: string;
  
  // 보안 설정
  public readonly bcryptRounds: number;
  
  // 업로드 설정
  public readonly maxFileSize: number;
  public readonly allowedImageTypes: string[];
  
  constructor(testConfig?: Record<string, string>) {
    if (testConfig) {
      // 테스트용 설정
      this.port = parseInt(testConfig.PORT || '8080', 10);
      this.nodeEnv = testConfig.NODE_ENV || 'test';
      this.databasePath = testConfig.DATABASE_PATH || ':memory:';
      this.jwtSecret = testConfig.JWT_SECRET || 'test-secret-key';
      this.jwtExpiresIn = testConfig.JWT_EXPIRES_IN || '1h';
      this.jwtIssuer = testConfig.JWT_ISSUER || 'mentor-mentee-app';
      this.jwtAudience = testConfig.JWT_AUDIENCE || 'mentor-mentee-users';
      this.bcryptRounds = parseInt(testConfig.BCRYPT_ROUNDS || '10', 10);
      this.maxFileSize = parseInt(testConfig.MAX_FILE_SIZE || '1048576', 10);
      this.allowedImageTypes = (testConfig.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png').split(',');
    } else {
      // 기본 설정 (환경 변수에서 로드)
      this.port = parseInt(process.env.PORT || '8080', 10);
      this.nodeEnv = process.env.NODE_ENV || 'development';
      this.databasePath = process.env.DATABASE_PATH || './data/database.sqlite';
      this.jwtSecret = process.env.JWT_SECRET || 'mentor-mentee-default-secret-key-change-in-production';
      this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
      this.jwtIssuer = process.env.JWT_ISSUER || 'mentor-mentee-app';
      this.jwtAudience = process.env.JWT_AUDIENCE || 'mentor-mentee-users';
      this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
      this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '1048576', 10); // 1MB
      this.allowedImageTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png').split(',');
    }
    
    this.validateConfig();
  }
  
  private validateConfig(): void {
    if (this.nodeEnv === 'production' && this.jwtSecret.includes('default')) {
      throw new Error('JWT_SECRET must be set in production environment');
    }
    
    if (this.port < 1 || this.port > 65535) {
      throw new Error('PORT must be between 1 and 65535');
    }
    
    if (this.bcryptRounds < 4 || this.bcryptRounds > 20) {
      throw new Error('BCRYPT_ROUNDS must be between 4 and 20');
    }
  }
  
  public isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }
  
  public isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
  
  public isTest(): boolean {
    return this.nodeEnv === 'test';
  }
}

// 싱글톤 인스턴스
export const config = new AppConfig();
