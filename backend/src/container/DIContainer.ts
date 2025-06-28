import { Database } from 'sqlite3';
import { UserModel } from '../models/User';
import { UserProfileModel } from '../models/UserProfile';
import { MatchRequestModel } from '../models/MatchRequest';
import { AuthService } from '../services/AuthService';
import { JWTService } from '../services/JWTService';
import { UserProfileService } from '../services/UserProfileService';
import { MentorService } from '../services/MentorService';
import { AppConfig } from '../config/AppConfig';

export interface ServiceContainer {
  // Config
  config: AppConfig;
  
  // Database
  database: Database;
  
  // Models
  userModel: UserModel;
  userProfileModel: UserProfileModel;
  matchRequestModel: MatchRequestModel;
  
  // Services
  jwtService: JWTService;
  authService: AuthService;
  userProfileService: UserProfileService;
  mentorService: MentorService;
}

export class DIContainer {
  private services: Partial<ServiceContainer> = {};
  private initialized = false;

  constructor(private appConfig: AppConfig, private database: Database) {
    this.services.config = appConfig;
    this.services.database = database;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Models 초기화
    this.services.userModel = new UserModel(this.database);
    this.services.userProfileModel = new UserProfileModel(this.database);
    this.services.matchRequestModel = new MatchRequestModel(this.database);

    // 데이터베이스 테이블 초기화
    await this.services.userModel.init();
    await this.services.userProfileModel.init();
    await this.services.matchRequestModel.init();

    // Services 초기화
    this.services.jwtService = new JWTService(
      this.appConfig.jwtSecret,
      this.appConfig.jwtIssuer,
      this.appConfig.jwtAudience
    );

    this.services.authService = new AuthService(
      this.services.userModel,
      this.services.userProfileModel,
      this.services.jwtService,
      this.appConfig.bcryptRounds
    );

    this.services.userProfileService = new UserProfileService(
      this.database,
      this.services.userModel,
      this.services.userProfileModel
    );

    this.services.mentorService = new MentorService(this.database);

    this.initialized = true;
  }

  get<K extends keyof ServiceContainer>(serviceName: K): ServiceContainer[K] {
    if (!this.initialized) {
      throw new Error('Container not initialized. Call initialize() first.');
    }

    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} not found in container`);
    }

    return service;
  }

  getAll(): ServiceContainer {
    if (!this.initialized) {
      throw new Error('Container not initialized. Call initialize() first.');
    }

    return this.services as ServiceContainer;
  }

  async dispose(): Promise<void> {
    if (this.services.database) {
      this.services.database.close();
    }
    this.services = {};
    this.initialized = false;
  }
}
