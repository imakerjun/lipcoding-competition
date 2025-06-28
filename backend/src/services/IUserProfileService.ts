export interface UpdateProfileData {
  name?: string;
  bio?: string;
  image?: string; // base64 encoded image
  skills?: string[]; // 멘토만 사용
}

export interface UserProfileData {
  id: number;
  email: string;
  role: 'mentor' | 'mentee';
  profile: {
    name: string;
    bio: string | null;
    imageUrl: string;
    skills?: string[]; // 멘토만 포함
  };
}

export interface ImageResult {
  isDefault: boolean;
  url?: string; // 기본 이미지 URL
  data?: Buffer; // 커스텀 이미지 데이터
  mimeType?: string; // 커스텀 이미지 MIME 타입
}

export interface IUserProfileService {
  getUserProfile(userId: number): Promise<UserProfileData>;
  updateUserProfile(userId: number, data: UpdateProfileData): Promise<UserProfileData>;
  getUserImage(userId: number, role: 'mentor' | 'mentee'): Promise<ImageResult>;
}
