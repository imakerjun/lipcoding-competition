import request from 'supertest';
import { app } from '../src/app';
import { DatabaseService } from '../src/database';
import bcrypt from 'bcryptjs';

describe('Authentication', () => {
  beforeAll(async () => {
    await DatabaseService.initialize();
  });

  afterAll(async () => {
    await DatabaseService.close();
  });

  beforeEach(async () => {
    // 테스트 전 데이터베이스 초기화
    const db = DatabaseService.getDatabase();
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM match_requests', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM user_profiles', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM users', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  describe('POST /api/signup', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'mentor' as const
      };

      const response = await request(app)
        .post('/api/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.role).toBe(userData.role);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 400 for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
        role: 'mentor' as const
      };

      const response = await request(app)
        .post('/api/signup')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'mentor' as const
      };

      // 첫 번째 사용자 생성
      await request(app)
        .post('/api/signup')
        .send(userData)
        .expect(201);

      // 동일한 이메일로 두 번째 사용자 생성 시도
      const response = await request(app)
        .post('/api/signup')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      // 테스트용 사용자 생성
      const hashedPassword = await bcrypt.hash('password123', 10);
      const db = DatabaseService.getDatabase();
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
          ['test@example.com', hashedPassword, 'Test User', 'mentor'],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/me', () => {
    let authToken: string;

    beforeEach(async () => {
      // 테스트용 사용자 생성 및 로그인
      const hashedPassword = await bcrypt.hash('password123', 10);
      const db = DatabaseService.getDatabase();
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
          ['test@example.com', hashedPassword, 'Test User', 'mentor'],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.token;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Test User');
      expect(response.body.role).toBe('mentor');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/me')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 