import { Database } from 'sqlite3';
import { UserProfile } from '../types';

export class UserProfileModel {
  constructor(private db: Database) {}

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS user_profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          bio TEXT,
          image_data BLOB,
          image_type TEXT,
          skills TEXT, -- JSON array as string
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `;

      this.db.run(createTableSQL, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async create(profileData: { 
    userId: number; 
    name: string; 
    bio: string; 
    skills?: string[];
    imageData?: Buffer;
    imageType?: string;
  }): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      const insertSQL = `
        INSERT INTO user_profiles (user_id, name, bio, image_data, image_type, skills, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;

      const skillsJson = profileData.skills ? JSON.stringify(profileData.skills) : null;
      const db = this.db;

      db.run(insertSQL, [
        profileData.userId,
        profileData.name,
        profileData.bio,
        profileData.imageData || null,
        profileData.imageType || null,
        skillsJson
      ], function(err: any) {
        if (err) {
          reject(err);
          return;
        }

        const profileId = this.lastID;
        
        // 생성된 프로필 조회
        const selectSQL = 'SELECT * FROM user_profiles WHERE id = ?';
        db.get(selectSQL, [profileId], (err: any, row: any) => {
          if (err) {
            reject(err);
            return;
          }

          const profile: UserProfile = {
            id: row.id,
            userId: row.user_id,
            name: row.name,
            bio: row.bio,
            imageData: row.image_data,
            imageType: row.image_type,
            skills: row.skills ? JSON.parse(row.skills) : [],
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
          };

          resolve(profile);
        });
      });
    });
  }

  async update(profileId: number, updateData: {
    name?: string;
    bio?: string;
    skills?: string[];
    imageData?: Buffer;
    imageType?: string;
  }): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      const updateSQL = `
        UPDATE user_profiles 
        SET name = COALESCE(?, name),
            bio = COALESCE(?, bio),
            image_data = COALESCE(?, image_data),
            image_type = COALESCE(?, image_type),
            skills = COALESCE(?, skills),
            updated_at = datetime('now')
        WHERE id = ?
      `;

      const skillsJson = updateData.skills ? JSON.stringify(updateData.skills) : undefined;

      this.db.run(updateSQL, [
        updateData.name,
        updateData.bio,
        updateData.imageData,
        updateData.imageType,
        skillsJson,
        profileId
      ], (err: any) => {
        if (err) {
          reject(err);
          return;
        }

        // 업데이트된 프로필 조회
        const selectSQL = 'SELECT * FROM user_profiles WHERE id = ?';
        this.db.get(selectSQL, [profileId], (err: any, row: any) => {
          if (err) {
            reject(err);
            return;
          }

          const profile: UserProfile = {
            id: row.id,
            userId: row.user_id,
            name: row.name,
            bio: row.bio,
            imageData: row.image_data,
            imageType: row.image_type,
            skills: row.skills ? JSON.parse(row.skills) : [],
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
          };

          resolve(profile);
        });
      });
    });
  }

  async findByUserId(userId: number): Promise<UserProfile | null> {
    return new Promise((resolve, reject) => {
      const selectSQL = 'SELECT * FROM user_profiles WHERE user_id = ?';
      
      this.db.get(selectSQL, [userId], (err: any, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        const profile: UserProfile = {
          id: row.id,
          userId: row.user_id,
          name: row.name,
          bio: row.bio,
          imageData: row.image_data,
          imageType: row.image_type,
          skills: row.skills ? JSON.parse(row.skills) : [],
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        };

        resolve(profile);
      });
    });
  }
}
