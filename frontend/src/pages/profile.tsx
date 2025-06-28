import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../services/auth';
import { userProfileService, UserProfile, UpdateProfileRequest } from '../services/userProfile';

export default function Profile(): JSX.Element {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    loadProfile();
  }, [router]);

  const loadProfile = async () => {
    try {
      const profileData = await userProfileService.getProfile();
      setProfile(profileData);
      setFormData({
        name: profileData.name,
        bio: profileData.bio,
      });
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      setError('프로필을 불러오는데 실패했습니다.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        name: profile.name,
        bio: profile.bio,
      });
    }
    setError(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedProfile = await userProfileService.updateProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setError('프로필 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">프로필</h1>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
          >
            로그아웃
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">사용자 정보</h2>
              <p className="text-gray-600">역할: {authService.getUserRole()}</p>
            </div>
            {!isEditing && (
              <button
                id="edit-profile"
                onClick={handleEdit}
                className="btn btn-primary"
              >
                수정
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  자기소개
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  className="input"
                  placeholder="자기소개를 입력해주세요..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  id="save-profile"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {isLoading ? '저장 중...' : '저장'}
                </button>
                <button
                  id="cancel-edit"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <p className="text-gray-900">{profile.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자기소개
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {profile.bio || '자기소개가 없습니다.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/mentors"
            className="text-primary-600 hover:text-primary-500"
          >
            멘토 목록 보러가기
          </a>
        </div>
      </div>
    </div>
  );
}
