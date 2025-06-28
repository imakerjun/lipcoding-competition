import { MentorService } from '../services/MentorService';
import { DIContainer } from '../container/DIContainer';
import { AppConfig } from '../config/AppConfig';
import { initDatabase } from '../database';

describe('MentorService', () => {
  let container: DIContainer;
  let mentorService: MentorService;

  beforeAll(async () => {
    const config = new AppConfig({
      databasePath: ':memory:'
    });
    
    container = await initDatabase(config);
    mentorService = container.get('mentorService');
  });

  afterAll(async () => {
    await container.dispose();
  });

  beforeEach(async () => {
    // 각 테스트 전에 테이블 정리 - 순서 중요!
    const database = container.get('database');
    
    return new Promise<void>((resolve) => {
      database.serialize(() => {
        database.run('DELETE FROM user_profiles', (err) => {
          if (err) console.error('Error deleting user_profiles:', err);
        });
        database.run('DELETE FROM users', (err) => {
          if (err) console.error('Error deleting users:', err);
          resolve();
        });
      });
    });
  });

  describe('getAllMentors', () => {
    it('should return empty array when no mentors exist', async () => {
      const mentors = await mentorService.getAllMentors();
      expect(mentors).toEqual([]);
    });

    it('should return only mentor users, not mentees', async () => {
      const authService = container.get('authService');
      
      // 멘토와 멘티 생성
      await authService.signup({
        email: 'mentor@test.com',
        password: 'password123',
        name: 'Test Mentor',
        role: 'mentor'
      });

      await authService.signup({
        email: 'mentee@test.com',
        password: 'password123',
        name: 'Test Mentee',
        role: 'mentee'
      });

      const mentors = await mentorService.getAllMentors();
      
      expect(mentors).toHaveLength(1);
      expect(mentors[0]!.name).toBe('Test Mentor');
      expect(mentors[0]!.email).toBe('mentor@test.com');
    });

    it('should include mentor profile information', async () => {
      const authService = container.get('authService');
      const userProfileService = container.get('userProfileService');
      
      const mentor = await authService.signup({
        email: 'mentor@test.com',
        password: 'password123',
        name: 'Test Mentor',
        role: 'mentor'
      });

      await userProfileService.updateUserProfile(mentor.user.id, {
        name: 'Updated Mentor',
        bio: 'Senior developer',
        skills: ['React', 'Node.js', 'TypeScript']
      });

      const mentors = await mentorService.getAllMentors();
      
      expect(mentors).toHaveLength(1);
      expect(mentors[0]).toMatchObject({
        id: mentor.user.id,
        name: 'Updated Mentor',
        email: 'mentor@test.com',
        bio: 'Senior developer',
        skillsets: ['React', 'Node.js', 'TypeScript']
      });
    });

    it('should include default profile information for mentors without profiles', async () => {
      const authService = container.get('authService');
      
      const mentor = await authService.signup({
        email: 'mentor@test.com',
        password: 'password123',
        name: 'Test Mentor',
        role: 'mentor'
      });

      const mentors = await mentorService.getAllMentors();
      
      expect(mentors).toHaveLength(1);
      expect(mentors[0]!).toMatchObject({
        id: mentor.user.id,
        name: 'Test Mentor',
        email: 'mentor@test.com',
        skillsets: []
      });
      expect(mentors[0]!.bio).toBeUndefined();
      expect(mentors[0]!.profileImage).toBeUndefined();
    });

    it('should sort mentors by ID in ascending order by default', async () => {
      const authService = container.get('authService');
      
      const mentor1 = await authService.signup({
        email: 'mentor1@test.com',
        password: 'password123',
        name: 'Zebra Mentor',
        role: 'mentor'
      });

      const mentor2 = await authService.signup({
        email: 'mentor2@test.com',
        password: 'password123',
        name: 'Alpha Mentor',
        role: 'mentor'
      });

      const mentors = await mentorService.getAllMentors();

      expect(mentors).toHaveLength(2);
      // ID 순으로 정렬되어야 함 (첫 번째로 생성된 것이 먼저)
      expect(mentors[0]!.id).toBe(mentor1.user.id);
      expect(mentors[1]!.id).toBe(mentor2.user.id);
    });
  });

  describe('getMentorsBySkill', () => {
    beforeEach(async () => {
      // 테스트용 멘토들 생성
      const authService = container.get('authService');
      const userProfileService = container.get('userProfileService');
      
      const mentor1 = await authService.signup({
        email: 'react-mentor@test.com',
        password: 'password123',
        name: 'React Expert',
        role: 'mentor'
      });

      const mentor2 = await authService.signup({
        email: 'node-mentor@test.com',
        password: 'password123',
        name: 'Node Specialist',
        role: 'mentor'
      });

      const mentor3 = await authService.signup({
        email: 'fullstack-mentor@test.com',
        password: 'password123',
        name: 'Fullstack Developer',
        role: 'mentor'
      });

      await userProfileService.updateUserProfile(mentor1.user.id, {
        name: 'React Expert',
        bio: 'Frontend specialist',
        skills: ['React', 'JavaScript', 'CSS']
      });

      await userProfileService.updateUserProfile(mentor2.user.id, {
        name: 'Node Specialist',
        bio: 'Backend expert',
        skills: ['Node.js', 'Express', 'MongoDB']
      });

      await userProfileService.updateUserProfile(mentor3.user.id, {
        name: 'Fullstack Developer',
        bio: 'Full stack engineer',
        skills: ['React', 'Node.js', 'TypeScript']
      });
    });

    it('should return mentors with specific skill', async () => {
      const reactMentors = await mentorService.getMentorsBySkill('React');
      
      expect(reactMentors).toHaveLength(2);
      expect(reactMentors.every((mentor: any) => 
        mentor.skillsets.includes('React')
      )).toBe(true);
    });

    it('should return empty array when no mentors have the skill', async () => {
      const pythonMentors = await mentorService.getMentorsBySkill('Python');
      expect(pythonMentors).toEqual([]);
    });

    it('should be case sensitive in skill search', async () => {
      const reactMentors = await mentorService.getMentorsBySkill('react');
      expect(reactMentors).toEqual([]);
    });

    it('should return mentors sorted by ID by default', async () => {
      const reactMentors = await mentorService.getMentorsBySkill('React');
      expect(reactMentors).toHaveLength(2);
      // ID 순서대로 정렬되어야 함
      expect(reactMentors[0]!.id).toBeLessThan(reactMentors[1]!.id);
    });
  });

  describe('getMentorById', () => {
    it('should return mentor by ID', async () => {
      const authService = container.get('authService');
      const userProfileService = container.get('userProfileService');
      
      const mentor = await authService.signup({
        email: 'mentor@test.com',
        password: 'password123',
        name: 'Test Mentor',
        role: 'mentor'
      });

      await userProfileService.updateUserProfile(mentor.user.id, {
        name: 'Updated Mentor',
        bio: 'Senior developer',
        skills: ['React', 'Node.js']
      });

      const foundMentor = await mentorService.getMentorById(mentor.user.id);
      
      expect(foundMentor).toMatchObject({
        id: mentor.user.id,
        name: 'Updated Mentor',
        email: 'mentor@test.com',
        bio: 'Senior developer',
        skillsets: ['React', 'Node.js']
      });
    });

    it('should return null for non-existent mentor', async () => {
      const mentor = await mentorService.getMentorById(999);
      expect(mentor).toBeNull();
    });

    it('should return null for mentee user', async () => {
      const authService = container.get('authService');
      
      const mentee = await authService.signup({
        email: 'mentee@test.com',
        password: 'password123',
        name: 'Test Mentee',
        role: 'mentee'
      });

      const mentor = await mentorService.getMentorById(mentee.user.id);
      expect(mentor).toBeNull();
    });
  });

  describe('sorting functionality', () => {
    beforeEach(async () => {
      const authService = container.get('authService');
      const userProfileService = container.get('userProfileService');
      
      const mentor1 = await authService.signup({
        email: 'mentor1@test.com',
        password: 'password123',
        name: 'Zebra Developer',
        role: 'mentor'
      });

      const mentor2 = await authService.signup({
        email: 'mentor2@test.com',
        password: 'password123',
        name: 'Alpha Engineer',
        role: 'mentor'
      });

      await userProfileService.updateUserProfile(mentor1.user.id, {
        name: 'Zebra Developer',
        bio: 'Senior developer',
        skills: ['Vue', 'CSS']
      });

      await userProfileService.updateUserProfile(mentor2.user.id, {
        name: 'Alpha Engineer',
        bio: 'Junior engineer',
        skills: ['React', 'JavaScript']
      });
    });

    it('should sort mentors by name in ascending order', async () => {
      const mentors = await mentorService.getAllMentors({ orderBy: 'name' });
      
      expect(mentors).toHaveLength(2);
      expect(mentors[0]!.name).toBe('Alpha Engineer');
      expect(mentors[1]!.name).toBe('Zebra Developer');
    });

    it('should sort mentors by primary skill in ascending order', async () => {
      const mentors = await mentorService.getAllMentors({ orderBy: 'skill' });
      
      expect(mentors).toHaveLength(2);
      // 첫 번째 스킬로 정렬 (React < Vue)
      expect(mentors[0]!.skillsets[0]).toBe('React');
      expect(mentors[1]!.skillsets[0]).toBe('Vue');
    });
  });

  describe('search with sorting', () => {
    beforeEach(async () => {
      // 테스트용 멘토들 생성
      const authService = container.get('authService');
      const userProfileService = container.get('userProfileService');
      
      const mentor1 = await authService.signup({
        email: 'mentor1@test.com',
        password: 'password123',
        name: 'Zebra React Dev',
        role: 'mentor'
      });

      const mentor2 = await authService.signup({
        email: 'mentor2@test.com',
        password: 'password123',
        name: 'Alpha React Expert',
        role: 'mentor'
      });

      await userProfileService.updateUserProfile(mentor1.user.id, {
        name: 'Zebra React Dev',
        bio: 'React developer',
        skills: ['React', 'Vue']
      });

      await userProfileService.updateUserProfile(mentor2.user.id, {
        name: 'Alpha React Expert',
        bio: 'React expert',
        skills: ['React', 'Angular']
      });
    });

    it('should search by skill and sort by name', async () => {
      const mentors = await mentorService.getMentorsBySkill('React', 'name');
      
      expect(mentors).toHaveLength(2);
      expect(mentors[0]!.name).toBe('Alpha React Expert');
      expect(mentors[1]!.name).toBe('Zebra React Dev');
    });

    it('should search by skill and sort by skill', async () => {
      const mentors = await mentorService.getMentorsBySkill('React', 'skill');
      
      expect(mentors).toHaveLength(2);
      // 첫 번째 스킬로 정렬 (Angular < Vue)
      expect(mentors[0]!.skillsets[1]).toBe('Angular');
      expect(mentors[1]!.skillsets[1]).toBe('Vue');
    });
  });
});
