import { apiClient } from './api';

export interface Mentor {
  id: number;
  name: string;
  bio: string;
  skills: string[];
  email: string;
  profileImage?: string;
}

export interface MentorSearchParams {
  search?: string;
  sortBy?: 'name' | 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

export interface MentorListResponse {
  mentors: Mentor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class MentorService {
  async getMentors(params: MentorSearchParams = {}): Promise<MentorListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `/mentors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<MentorListResponse>(url);
    return response;
  }
}

export const mentorService = new MentorService();
