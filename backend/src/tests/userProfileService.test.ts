import { UserProfileService } from '../services/UserProfileService';
import { DIContainer } from '../container/DIContainer';
import { AppConfig } from '../config/AppConfig';
import { initDatabase } from '../database';

describe('UserProfileService', () => {
  let container: DIContainer;
  let userProfileService: UserProfileService;

  beforeAll(async () => {
    const testConfig = new AppConfig({
      NODE_ENV: 'test',
      DATABASE_PATH: ':memory:',
      JWT_SECRET: 'test-secret'
    });

    container = await initDatabase(testConfig);
    userProfileService = container.get('userProfileService');
  });

  beforeEach(async () => {
    // 테스트 데이터 정리
    const db = container.get('database');
    await db.exec('DELETE FROM user_profiles');
    await db.exec('DELETE FROM users');
  });

  afterAll(async () => {
    const db = container.get('database');
    await new Promise<void>((resolve) => {
      db.close(() => resolve());
    });
  });

  describe('getUserProfile', () => {
    it('should return mentor profile with skills', async () => {
      // 테스트용 멘토 사용자 생성
      const authService = container.get('authService');
      const result = await authService.signup({
        email: 'mentor@test.com',
        password: 'password123',
        name: 'Test Mentor',
        role: 'mentor'
      });

      const profile = await userProfileService.getUserProfile(result.user.id);

      expect(profile).toMatchObject({
        id: result.user.id,
        email: 'mentor@test.com',
        role: 'mentor',
        profile: {
          name: 'Test Mentor',
          bio: null,
          imageUrl: `/images/mentor/${result.user.id}`,
          skills: []
        }
      });
    });

    it('should return mentee profile without skills', async () => {
      // 테스트용 멘티 사용자 생성
      const authService = container.get('authService');
      const result = await authService.signup({
        email: 'mentee@test.com',
        password: 'password123',
        name: 'Test Mentee',
        role: 'mentee'
      });

      const profile = await userProfileService.getUserProfile(result.user.id);

      expect(profile).toMatchObject({
        id: result.user.id,
        email: 'mentee@test.com',
        role: 'mentee',
        profile: {
          name: 'Test Mentee',
          bio: null,
          imageUrl: `/images/mentee/${result.user.id}`
        }
      });

      // 멘티 프로필에는 skills 필드가 없어야 함
      expect(profile.profile.skills).toBeUndefined();
    });

    it('should throw error for non-existent user', async () => {
      await expect(userProfileService.getUserProfile(99999))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('updateUserProfile', () => {
    it('should update mentor profile with skills', async () => {
      // 테스트용 멘토 사용자 생성
      const authService = container.get('authService');
      const result = await authService.signup({
        email: 'mentor@test.com',
        password: 'password123',
        name: 'Test Mentor',
        role: 'mentor'
      });

      const updateData = {
        name: 'Updated Mentor Name',
        bio: 'I am an experienced React developer',
        skills: ['React', 'TypeScript', 'Node.js']
      };

      const updatedProfile = await userProfileService.updateUserProfile(result.user.id, updateData);

      expect(updatedProfile).toMatchObject({
        id: result.user.id,
        email: 'mentor@test.com',
        role: 'mentor',
        profile: {
          name: 'Updated Mentor Name',
          bio: 'I am an experienced React developer',
          imageUrl: `/images/mentor/${result.user.id}`,
          skills: ['React', 'TypeScript', 'Node.js']
        }
      });
    });

    it('should update mentee profile without skills', async () => {
      // 테스트용 멘티 사용자 생성
      const authService = container.get('authService');
      const result = await authService.signup({
        email: 'mentee@test.com',
        password: 'password123',
        name: 'Test Mentee',
        role: 'mentee'
      });

      const updateData = {
        name: 'Updated Mentee Name',
        bio: 'I want to learn frontend development'
      };

      const updatedProfile = await userProfileService.updateUserProfile(result.user.id, updateData);

      expect(updatedProfile).toMatchObject({
        id: result.user.id,
        email: 'mentee@test.com',
        role: 'mentee',
        profile: {
          name: 'Updated Mentee Name',
          bio: 'I want to learn frontend development',
          imageUrl: `/images/mentee/${result.user.id}`
        }
      });

      // 멘티 프로필에는 skills 필드가 없어야 함
      expect(updatedProfile.profile.skills).toBeUndefined();
    });

    it('should ignore skills field for mentee', async () => {
      // 테스트용 멘티 사용자 생성
      const authService = container.get('authService');
      const result = await authService.signup({
        email: 'mentee@test.com',
        password: 'password123',
        name: 'Test Mentee',
        role: 'mentee'
      });

      const updateData = {
        name: 'Updated Mentee Name',
        bio: 'I want to learn frontend development',
        skills: ['React'] // 멘티는 skills를 보내도 무시되어야 함
      };

      const updatedProfile = await userProfileService.updateUserProfile(result.user.id, updateData);

      expect(updatedProfile.profile.skills).toBeUndefined();
    });

    it('should handle base64 image update', async () => {
      // 테스트용 멘토 사용자 생성
      const authService = container.get('authService');
      const result = await authService.signup({
        email: 'mentor@test.com',
        password: 'password123',
        name: 'Test Mentor',
        role: 'mentor'
      });

      const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

      const updateData = {
        name: 'Updated Mentor Name',
        bio: 'I am an experienced React developer',
        image: base64Image,
        skills: ['React', 'TypeScript']
      };

      const updatedProfile = await userProfileService.updateUserProfile(result.user.id, updateData);

      expect(updatedProfile.profile.imageUrl).toBe(`/images/mentor/${result.user.id}`);
    });

    it('should throw error for non-existent user', async () => {
      const updateData = {
        name: 'Updated Name',
        bio: 'Updated bio'
      };

      await expect(userProfileService.updateUserProfile(99999, updateData))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('getUserImage', () => {
    it('should return default image URL when no custom image', async () => {
      // 테스트용 멘토 사용자 생성
      const authService = container.get('authService');
      const result = await authService.signup({
        email: 'mentor@test.com',
        password: 'password123',
        name: 'Test Mentor',
        role: 'mentor'
      });

      const imageResult = await userProfileService.getUserImage(result.user.id, 'mentor');

      expect(imageResult.isDefault).toBe(true);
      expect(imageResult.url).toBe('https://placehold.co/500x500.jpg?text=MENTOR');
    });

    it('should return custom image when available', async () => {
      // 테스트용 멘토 사용자 생성
      const authService = container.get('authService');
      const result = await authService.signup({
        email: 'mentor@test.com',
        password: 'password123',
        name: 'Test Mentor',
        role: 'mentor'
      });

      // 이미지 업로드
      const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
      
      await userProfileService.updateUserProfile(result.user.id, {
        name: 'Test Mentor',
        bio: 'Test bio',
        image: base64Image,
        skills: ['React']
      });

      const imageResult = await userProfileService.getUserImage(result.user.id, 'mentor');

      expect(imageResult.isDefault).toBe(false);
      expect(imageResult.data).toBeDefined();
      expect(imageResult.mimeType).toBe('image/jpeg');
    });

    it('should throw error for non-existent user', async () => {
      await expect(userProfileService.getUserImage(99999, 'mentor'))
        .rejects
        .toThrow('User not found');
    });
  });
});
