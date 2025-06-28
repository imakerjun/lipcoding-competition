import { Database } from 'sqlite3';
import { User } from '../types';

export class UserModel {
  constructor(private db: Database) {}

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT CHECK(role IN ('mentor', 'mentee')) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(createTableSQL, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async create(userData: { email: string; password: string; role: 'mentor' | 'mentee' }): Promise<User> {
    return new Promise((resolve, reject) => {
      const insertSQL = `
        INSERT INTO users (email, password, role, created_at, updated_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `;

      const db = this.db; // 클로저에서 사용하기 위해 저장

      db.run(insertSQL, [userData.email, userData.password, userData.role], function(err: any) {
        if (err) {
          reject(err);
          return;
        }

        const userId = this.lastID;
        
        // 생성된 사용자 조회
        const selectSQL = 'SELECT * FROM users WHERE id = ?';
        db.get(selectSQL, [userId], (err: any, row: any) => {
          if (err) {
            reject(err);
            return;
          }

          const user: User = {
            id: row.id,
            email: row.email,
            password: row.password,
            role: row.role,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
          };

          resolve(user);
        });
      });
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const selectSQL = 'SELECT * FROM users WHERE email = ?';
      
      this.db.get(selectSQL, [email], (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        const user: User = {
          id: row.id,
          email: row.email,
          password: row.password,
          role: row.role,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        };

        resolve(user);
      });
    });
  }

  async findById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const selectSQL = 'SELECT * FROM users WHERE id = ?';
      
      this.db.get(selectSQL, [id], (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        const user: User = {
          id: row.id,
          email: row.email,
          password: row.password,
          role: row.role,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        };

        resolve(user);
      });
    });
  }
}
