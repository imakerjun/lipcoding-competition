import { IMatchRequestService } from '../services/IMatchRequestService';
import { Database } from 'sqlite3';
import { AuthService } from '../services/AuthService';
import { UserProfileService } from '../services/UserProfileService';
import { DIContainer } from '../container/DIContainer';
import { AppConfig } from '../config/AppConfig';

describe('MatchRequestService', () => {
  let matchRequestService: IMatchRequestService;
  let database: Database;
  let container: DIContainer;
  let mentorId: number;
  let menteeId: number;

  beforeAll(async () => {
    const config = new AppConfig();
    database = new Database(':memory:');
    container = new DIContainer(config, database);
    
    await container.initialize();
    
    matchRequestService = container.get('matchRequestService') as IMatchRequestService;
    
    const authService = container.get('authService') as AuthService;
    const userProfileService = container.get('userProfileService') as UserProfileService;
    
    const mentorResult = await authService.signup({
      email: 'mentor@test.com',
      password: 'password123',
      name: 'Test Mentor',
      role: 'mentor'
    });
    mentorId = mentorResult.user.id;
    
    await userProfileService.updateUserProfile(mentorId, {
      bio: 'Experienced mentor',
      skills: ['JavaScript', 'TypeScript', 'React']
    });
    
    const menteeResult = await authService.signup({
      email: 'mentee@test.com',
      password: 'password123',
      name: 'Test Mentee',
      role: 'mentee'
    });
    menteeId = menteeResult.user.id;
  });

  afterAll(async () => {
    if (database) {
      database.close();
    }
  });

  test('should create a new match request successfully', async () => {
    const requestData = {
      mentorId: mentorId,
      menteeId: menteeId,
      message: 'I would like to learn JavaScript from you!'
    };

    const result = await matchRequestService.createMatchRequest(requestData);

    expect(result).toBeDefined();
    expect(result.mentorId).toBe(mentorId);
    expect(result.menteeId).toBe(menteeId);
    expect(result.message).toBe(requestData.message);
    expect(result.status).toBe('pending');
    expect(result.createdAt).toBeDefined();
  });
});
