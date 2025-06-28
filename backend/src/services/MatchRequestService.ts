import { Database } from 'sqlite3';
import { IMatchRequestService, CreateMatchRequestRequest, MatchRequestWithDetails } from './IMatchRequestService';
import { MatchRequestModel } from '../models/MatchRequest';
import { UserModel } from '../models/User';

export class MatchRequestService implements IMatchRequestService {
  constructor(
    private database: Database,
    private matchRequestModel: MatchRequestModel,
    private userModel: UserModel
  ) {}

  async createMatchRequest(request: CreateMatchRequestRequest): Promise<MatchRequestWithDetails> {
    // 간단한 구현으로 시작
    const matchRequest = await this.matchRequestModel.create({
      mentorId: request.mentorId,
      menteeId: request.menteeId,
      message: request.message
    });

    return {
      id: matchRequest.id,
      mentorId: matchRequest.mentorId,
      menteeId: matchRequest.menteeId,
      message: matchRequest.message,
      status: 'pending',
      createdAt: matchRequest.createdAt
    };
  }

  async getIncomingRequests(userId: number): Promise<MatchRequestWithDetails[]> {
    const requests = await this.matchRequestModel.findIncomingRequests(userId);
    return requests;
  }

  async getOutgoingRequests(userId: number): Promise<MatchRequestWithDetails[]> {
    const requests = await this.matchRequestModel.findOutgoingRequests(userId);
    return requests;
  }

  async acceptRequest(requestId: number, userId: number): Promise<boolean> {
    await this.matchRequestModel.updateStatus(requestId, 'accepted');
    return true;
  }

  async rejectRequest(requestId: number, userId: number): Promise<boolean> {
    await this.matchRequestModel.updateStatus(requestId, 'rejected');
    return true;
  }

  async cancelRequest(requestId: number, userId: number): Promise<boolean> {
    await this.matchRequestModel.delete(requestId);
    return true;
  }
}
