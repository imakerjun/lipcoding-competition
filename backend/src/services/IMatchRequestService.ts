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
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  mentorName?: string;
  menteeName?: string;
}

export interface IMatchRequestService {
  createMatchRequest(request: CreateMatchRequestRequest): Promise<MatchRequestWithDetails>;
  getIncomingRequests(userId: number): Promise<MatchRequestWithDetails[]>;
  getOutgoingRequests(userId: number): Promise<MatchRequestWithDetails[]>;
  acceptRequest(requestId: number, userId: number): Promise<boolean>;
  rejectRequest(requestId: number, userId: number): Promise<boolean>;
  cancelRequest(requestId: number, userId: number): Promise<boolean>;
}
