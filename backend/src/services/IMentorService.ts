

export interface MentorInfo {
  id: number;
  name: string;
  email: string;
  bio?: string;
  skillsets: string[];
  profileImage?: string;
}

export interface MentorListOptions {
  skill?: string;
  orderBy?: 'name' | 'skill' | 'id';
}

export interface IMentorService {
  /**
   * 모든 멘토 목록을 조회합니다
   */
  getAllMentors(options?: MentorListOptions): Promise<MentorInfo[]>;

  /**
   * 특정 스킬을 가진 멘토들을 조회합니다
   */
  getMentorsBySkill(skill: string, orderBy?: 'name' | 'skill' | 'id'): Promise<MentorInfo[]>;

  /**
   * 멘토 ID로 멘토 정보를 조회합니다
   */
  getMentorById(id: number): Promise<MentorInfo | null>;
}
