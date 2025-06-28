import { Database } from 'sqlite3';
import { UserModel } from '../models/User';
import { UserProfileModel } from '../models/UserProfile';
import { MatchRequestModel } from '../models/MatchRequest';

describe('Database Models', () => {
  let db: Database;
  let userModel: UserModel;
  let userProfileModel: UserProfileModel;
  let matchRequestModel: MatchRequestModel;

  beforeAll(async () => {
    // 인메모리 테스트 데이터베이스 생성
    db = new Database(':memory:');
    userModel = new UserModel(db);
    userProfileModel = new UserProfileModel(db);
    matchRequestModel = new MatchRequestModel(db);
    
    // 테이블 초기화
    await userModel.init();
    await userProfileModel.init();
    await matchRequestModel.init();
  });

  afterAll(async () => {
    db.close();
  });

  beforeEach(async () => {
    // 각 테스트 전에 모든 테이블 데이터 삭제
    return new Promise<void>((resolve) => {
      db.serialize(() => {
        db.run('DELETE FROM match_requests');
        db.run('DELETE FROM user_profiles');
        db.run('DELETE FROM users', () => {
          resolve();
        });
      });
    });
  });

  describe('User Model', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'mentor' as const
      };

      const user = await userModel.create(userData);
      
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.createdAt).toBeDefined();
    });

    it('should not allow duplicate emails', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'hashedpassword',
        role: 'mentee' as const
      };

      await userModel.create(userData);
      
      await expect(userModel.create(userData))
        .rejects.toThrow('UNIQUE constraint failed');
    });

    it('should find user by email', async () => {
      const userData = {
        email: 'findme@example.com',
        password: 'hashedpassword',
        role: 'mentor' as const
      };

      const createdUser = await userModel.create(userData);
      const foundUser = await userModel.findByEmail(userData.email);
      
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(userData.email);
    });

    it('should find user by id', async () => {
      const userData = {
        email: 'findbyid@example.com',
        password: 'hashedpassword',
        role: 'mentee' as const
      };

      const createdUser = await userModel.create(userData);
      const foundUser = await userModel.findById(createdUser.id);
      
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(userData.email);
    });
  });

  describe('UserProfile Model', () => {
    let userId: number;

    beforeEach(async () => {
      const user = await userModel.create({
        email: `profile-test-${Date.now()}@example.com`,
        password: 'hashedpassword',
        role: 'mentor'
      });
      userId = user.id;
    });

    it('should create a user profile', async () => {
      const profileData = {
        userId,
        name: 'Test User',
        bio: 'Test bio',
        skills: ['React', 'Node.js']
      };

      const profile = await userProfileModel.create(profileData);
      
      expect(profile).toBeDefined();
      expect(profile.id).toBeDefined();
      expect(profile.userId).toBe(userId);
      expect(profile.name).toBe(profileData.name);
      expect(profile.bio).toBe(profileData.bio);
      expect(profile.skills).toEqual(profileData.skills);
    });

    it('should update user profile', async () => {
      const profileData = {
        userId,
        name: 'Test User',
        bio: 'Original bio',
        skills: ['React']
      };

      const profile = await userProfileModel.create(profileData);
      
      const updatedData = {
        name: 'Updated User',
        bio: 'Updated bio',
        skills: ['React', 'Vue', 'Angular']
      };

      const updatedProfile = await userProfileModel.update(profile.id, updatedData);
      
      expect(updatedProfile.name).toBe(updatedData.name);
      expect(updatedProfile.bio).toBe(updatedData.bio);
      expect(updatedProfile.skills).toEqual(updatedData.skills);
    });

    it('should find profile by user id', async () => {
      const profileData = {
        userId,
        name: 'Find Me User',
        bio: 'Find me bio',
        skills: ['TypeScript']
      };

      await userProfileModel.create(profileData);
      const foundProfile = await userProfileModel.findByUserId(userId);
      
      expect(foundProfile).toBeDefined();
      expect(foundProfile?.userId).toBe(userId);
      expect(foundProfile?.name).toBe(profileData.name);
    });
  });

  describe('MatchRequest Model', () => {
    let mentorId: number;
    let menteeId: number;

    beforeEach(async () => {
      const mentor = await userModel.create({
        email: `mentor-${Date.now()}@example.com`,
        password: 'hashedpassword',
        role: 'mentor'
      });
      
      const mentee = await userModel.create({
        email: `mentee-${Date.now()}@example.com`,
        password: 'hashedpassword',
        role: 'mentee'
      });

      mentorId = mentor.id;
      menteeId = mentee.id;
    });

    it('should create a match request', async () => {
      const requestData = {
        mentorId,
        menteeId,
        message: 'I would like to learn from you!'
      };

      const request = await matchRequestModel.create(requestData);
      
      expect(request).toBeDefined();
      expect(request.id).toBeDefined();
      expect(request.mentorId).toBe(mentorId);
      expect(request.menteeId).toBe(menteeId);
      expect(request.message).toBe(requestData.message);
      expect(request.status).toBe('pending');
    });

    it('should update request status', async () => {
      const requestData = {
        mentorId,
        menteeId,
        message: 'Please mentor me!'
      };

      const request = await matchRequestModel.create(requestData);
      const updatedRequest = await matchRequestModel.updateStatus(request.id, 'accepted');
      
      expect(updatedRequest.status).toBe('accepted');
    });

    it('should find requests by mentor id', async () => {
      const requestData = {
        mentorId,
        menteeId,
        message: 'Find me by mentor!'
      };

      await matchRequestModel.create(requestData);
      const requests = await matchRequestModel.findByMentorId(mentorId);
      
      expect(requests).toHaveLength(1);
      expect(requests[0]?.mentorId).toBe(mentorId);
    });

    it('should find requests by mentee id', async () => {
      const requestData = {
        mentorId,
        menteeId,
        message: 'Find me by mentee!'
      };

      await matchRequestModel.create(requestData);
      const requests = await matchRequestModel.findByMenteeId(menteeId);
      
      expect(requests).toHaveLength(1);
      expect(requests[0]?.menteeId).toBe(menteeId);
    });
  });
});
