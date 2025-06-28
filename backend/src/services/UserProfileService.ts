import { Database } from 'sqlite3';
import { UserModel } from '../models/User';
import { UserProfileModel } from '../models/UserProfile';
import { 
  IUserProfileService, 
  UpdateProfileData, 
  UserProfileData, 
  ImageResult 
} from './IUserProfileService';
import { AppError, ErrorCode } from '../errors/AppError';

export class UserProfileService implements IUserProfileService {
  constructor(
    private database: Database,
    private userModel: UserModel,
    private userProfileModel: UserProfileModel
  ) {}

  async getUserProfile(userId: number): Promise<UserProfileData> {
    return new Promise((resolve, reject) => {
      this.database.get(
        `SELECT 
          u.id, u.email, u.role,
          up.name, up.bio, up.skills, up.image_data, up.image_type
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         WHERE u.id = ?`,
        [userId],
        (err, row: any) => {
          if (err) {
            reject(new AppError(ErrorCode.DATABASE_ERROR, 'Database error', 500, true, err));
            return;
          }

          if (!row) {
            reject(new AppError(ErrorCode.USER_NOT_FOUND, 'User not found', 404));
            return;
          }

          const profile: UserProfileData = {
            id: row.id,
            email: row.email,
            role: row.role,
            profile: {
              name: row.name || '',
              bio: row.bio || null,
              imageUrl: `/images/${row.role}/${row.id}`
            }
          };

          // 멘토인 경우에만 skills 필드 추가
          if (row.role === 'mentor') {
            profile.profile.skills = row.skills ? JSON.parse(row.skills) : [];
          }

          resolve(profile);
        }
      );
    });
  }

  async updateUserProfile(userId: number, data: UpdateProfileData): Promise<UserProfileData> {
    // 먼저 사용자 존재 확인
    const user = await this.getUserProfile(userId);

    return new Promise((resolve, reject) => {
      // 프로필 데이터 준비
      const profileData: any = {
        user_id: userId,
        name: data.name !== undefined ? data.name : user.profile.name,
        bio: data.bio !== undefined ? data.bio : user.profile.bio
      };

      // 멘토인 경우에만 skills 처리
      if (user.role === 'mentor') {
        if (data.skills !== undefined) {
          profileData.skills = JSON.stringify(data.skills);
        } else {
          profileData.skills = user.profile.skills ? JSON.stringify(user.profile.skills) : null;
        }
      }        // 이미지 데이터 처리
        if (data.image) {
          try {
            const { data: imageData, mimeType } = this.parseBase64Image(data.image);
            profileData.image_data = imageData;
            profileData.image_type = mimeType;
          } catch (error) {
            reject(new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid image format'));
            return;
          }
        }

      // 기존 프로필이 있는지 확인하고 UPDATE 또는 INSERT
      this.database.get(
        `SELECT id FROM user_profiles WHERE user_id = ?`,
        [userId],
        (err: any, existingProfile: any) => {
          if (err) {
            reject(new AppError(ErrorCode.DATABASE_ERROR, 'Failed to check existing profile', 500, true, err));
            return;
          }

          let sql: string;
          let params: any[];

          if (existingProfile) {
            // UPDATE
            sql = `UPDATE user_profiles 
                   SET name = ?, bio = ?, skills = ?, image_data = ?, image_type = ?, updated_at = datetime('now')
                   WHERE user_id = ?`;
            params = [
              profileData.name,
              profileData.bio,
              profileData.skills || null,
              profileData.image_data || null,
              profileData.image_type || null,
              userId
            ];
          } else {
            // INSERT
            sql = `INSERT INTO user_profiles 
                   (user_id, name, bio, skills, image_data, image_type, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;
            params = [
              profileData.user_id,
              profileData.name,
              profileData.bio,
              profileData.skills || null,
              profileData.image_data || null,
              profileData.image_type || null
            ];
          }

          this.database.run(sql, params, (err: any) => {
            if (err) {
              console.error('SQL Error:', err);
              console.error('SQL:', sql);
              console.error('Params:', params);
              reject(new AppError(ErrorCode.DATABASE_ERROR, 'Failed to update profile', 500, true, err));
              return;
            }

            // 업데이트된 프로필 반환
            this.getUserProfile(userId)
              .then(resolve)
              .catch(reject);
          });
        }
      );
    });
  }

  async getUserImage(userId: number, role: 'mentor' | 'mentee'): Promise<ImageResult> {
    return new Promise((resolve, reject) => {
      this.database.get(
        `SELECT up.image_data, up.image_type
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         WHERE u.id = ? AND u.role = ?`,
        [userId, role],
        (err, row: any) => {
          if (err) {
            reject(new AppError(ErrorCode.DATABASE_ERROR, 'Database error', 500, true, err));
            return;
          }

          if (!row) {
            reject(new AppError(ErrorCode.USER_NOT_FOUND, 'User not found', 404));
            return;
          }

          // 커스텀 이미지가 있는 경우
          if (row.image_data && row.image_type) {
            resolve({
              isDefault: false,
              data: row.image_data,
              mimeType: row.image_type
            });
            return;
          }

          // 기본 이미지 반환
          const defaultImageUrl = role === 'mentor' 
            ? 'https://placehold.co/500x500.jpg?text=MENTOR'
            : 'https://placehold.co/500x500.jpg?text=MENTEE';

          resolve({
            isDefault: true,
            url: defaultImageUrl
          });
        }
      );
    });
  }

  private parseBase64Image(base64String: string): { data: Buffer; mimeType: string } {
    // data:image/jpeg;base64,/9j/4AAQ... 형식 파싱
    const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      throw new Error('Invalid base64 image format');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    if (!mimeType || !base64Data) {
      throw new Error('Invalid base64 image format');
    }

    // 지원되는 이미지 타입 확인
    if (!['image/jpeg', 'image/png'].includes(mimeType)) {
      throw new Error('Unsupported image type. Only JPEG and PNG are allowed.');
    }

    const imageData = Buffer.from(base64Data, 'base64');

    // 파일 크기 확인 (1MB 제한)
    const maxSize = 1024 * 1024; // 1MB
    if (imageData.length > maxSize) {
      throw new Error('Image size too large. Maximum 1MB allowed.');
    }

    return {
      data: imageData,
      mimeType
    };
  }
}
