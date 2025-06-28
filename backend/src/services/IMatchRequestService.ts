export interface CreateMatchRequestRequest {
  mentorId: number;
  menteeId: number;
  message: string;
}

export interface MatchRequestWithDetails {
  id: number;
  mentorId: number;
  menteeId: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: Date;
  mentorName?: string;
  menteeName?: string;
}

export interface IMatchRequestService {
  createMatchRequest(request: CreateMatchRequestRequest): Promise<MatchRequestWithDetails>;
  getIncomingRequests(userId: number): Promise<MatchRequestWithDetails[]>;
  getOutgoingRequests(userId: number): Promise<MatchRequestWithDetails[]>;
  acceptRequest(requestId: number, userId: number): Promise<MatchRequestWithDetails>;
  rejectRequest(requestId: number, userId: number): Promise<MatchRequestWithDetails>;
  cancelRequest(requestId: number, userId: number): Promise<MatchRequestWithDetails>;
}
