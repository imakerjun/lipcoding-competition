import { apiClient, ApiResponse } from './api';

export interface UserProfile {
  id: number;
  name: string;
  bio: string;
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
}

class UserProfileService {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/me');
    return response;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/profile', data);
    return response;
  }

  async uploadProfileImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiClient.post<{ imageUrl: string }>('/profile/image', formData);
    return response.imageUrl;
  }
}

export const userProfileService = new UserProfileService();
