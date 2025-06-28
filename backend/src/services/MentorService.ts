import { Database } from 'sqlite3';
import { IMentorService, MentorInfo, MentorListOptions } from './IMentorService';

export class MentorService implements IMentorService {
  constructor(private db: Database) {}

  async getAllMentors(options: MentorListOptions = {}): Promise<MentorInfo[]> {
    const { skill, orderBy = 'id' } = options;

    let query = `
      SELECT 
        u.id,
        u.email,
        COALESCE(up.name, '') as name,
        up.bio,
        up.skills,
        up.image_data as profileImage
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.role = 'mentor'
    `;

    const params: any[] = [];

    // 정렬
    switch (orderBy) {
      case 'name':
        query += ` ORDER BY COALESCE(up.name, '') ASC`;
        break;
      case 'skill':
        query += ` ORDER BY up.skills ASC, u.id ASC`;
        break;
      default:
        query += ` ORDER BY u.id ASC`;
        break;
    }

    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        let mentors = rows.map(row => ({
          id: row.id,
          name: row.name,
          email: row.email,
          bio: row.bio || undefined,
          skillsets: this.parseSkillsets(row.skills),
          profileImage: row.profileImage || undefined
        }));

        // 스킬 필터링 (JavaScript에서 정확한 매칭)
        if (skill) {
          mentors = mentors.filter(mentor => 
            mentor.skillsets.includes(skill)
          );
        }

        resolve(mentors);
      });
    });
  }

  async getMentorsBySkill(skill: string, orderBy: 'name' | 'skill' | 'id' = 'id'): Promise<MentorInfo[]> {
    return this.getAllMentors({ skill, orderBy });
  }

  async getMentorById(id: number): Promise<MentorInfo | null> {
    const query = `
      SELECT 
        u.id,
        u.email,
        COALESCE(up.name, '') as name,
        up.bio,
        up.skills,
        up.image_data as profileImage
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ? AND u.role = 'mentor'
    `;

    return new Promise((resolve, reject) => {
      this.db.get(query, [id], (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        resolve({
          id: row.id,
          name: row.name,
          email: row.email,
          bio: row.bio || undefined,
          skillsets: this.parseSkillsets(row.skills),
          profileImage: row.profileImage || undefined
        });
      });
    });
  }

  private parseSkillsets(skillsetsStr: string | null): string[] {
    if (!skillsetsStr) {
      return [];
    }

    try {
      const parsed = JSON.parse(skillsetsStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // JSON 파싱 실패 시 쉼표로 분리된 문자열로 처리
      return skillsetsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
  }
}
