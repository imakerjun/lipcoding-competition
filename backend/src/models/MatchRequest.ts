import { Database } from 'sqlite3';
import { MatchRequest } from '../types';

export class MatchRequestModel {
  constructor(private db: Database) {}

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS match_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mentor_id INTEGER NOT NULL,
          mentee_id INTEGER NOT NULL,
          message TEXT NOT NULL,
          status TEXT CHECK(status IN ('pending', 'accepted', 'rejected', 'cancelled')) DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (mentor_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (mentee_id) REFERENCES users (id) ON DELETE CASCADE,
          UNIQUE(mentor_id, mentee_id)
        )
      `;

      this.db.run(createTableSQL, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async create(requestData: {
    mentorId: number;
    menteeId: number;
    message: string;
  }): Promise<MatchRequest> {
    return new Promise((resolve, reject) => {
      const insertSQL = `
        INSERT INTO match_requests (mentor_id, mentee_id, message, status, created_at, updated_at)
        VALUES (?, ?, ?, 'pending', datetime('now'), datetime('now'))
      `;

      const db = this.db;

      db.run(insertSQL, [
        requestData.mentorId,
        requestData.menteeId,
        requestData.message
      ], function(err: any) {
        if (err) {
          reject(err);
          return;
        }

        const requestId = this.lastID;
        
        // 생성된 요청 조회
        const selectSQL = 'SELECT * FROM match_requests WHERE id = ?';
        db.get(selectSQL, [requestId], (err: any, row: any) => {
          if (err) {
            reject(err);
            return;
          }

          const request: MatchRequest = {
            id: row.id,
            mentorId: row.mentor_id,
            menteeId: row.mentee_id,
            message: row.message,
            status: row.status,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
          };

          resolve(request);
        });
      });
    });
  }

  async updateStatus(requestId: number, status: 'pending' | 'accepted' | 'rejected' | 'cancelled'): Promise<MatchRequest> {
    return new Promise((resolve, reject) => {
      const updateSQL = `
        UPDATE match_requests 
        SET status = ?, updated_at = datetime('now')
        WHERE id = ?
      `;

      this.db.run(updateSQL, [status, requestId], (err: any) => {
        if (err) {
          reject(err);
          return;
        }

        // 업데이트된 요청 조회
        const selectSQL = 'SELECT * FROM match_requests WHERE id = ?';
        this.db.get(selectSQL, [requestId], (err: any, row: any) => {
          if (err) {
            reject(err);
            return;
          }

          const request: MatchRequest = {
            id: row.id,
            mentorId: row.mentor_id,
            menteeId: row.mentee_id,
            message: row.message,
            status: row.status,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
          };

          resolve(request);
        });
      });
    });
  }

  async findByMentorId(mentorId: number): Promise<MatchRequest[]> {
    return new Promise((resolve, reject) => {
      const selectSQL = 'SELECT * FROM match_requests WHERE mentor_id = ? ORDER BY created_at DESC';
      
      this.db.all(selectSQL, [mentorId], (err: any, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        const requests: MatchRequest[] = rows.map(row => ({
          id: row.id,
          mentorId: row.mentor_id,
          menteeId: row.mentee_id,
          message: row.message,
          status: row.status,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        }));

        resolve(requests);
      });
    });
  }

  async findByMenteeId(menteeId: number): Promise<MatchRequest[]> {
    return new Promise((resolve, reject) => {
      const selectSQL = 'SELECT * FROM match_requests WHERE mentee_id = ? ORDER BY created_at DESC';
      
      this.db.all(selectSQL, [menteeId], (err: any, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        const requests: MatchRequest[] = rows.map(row => ({
          id: row.id,
          mentorId: row.mentor_id,
          menteeId: row.mentee_id,
          message: row.message,
          status: row.status,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        }));

        resolve(requests);
      });
    });
  }
}
