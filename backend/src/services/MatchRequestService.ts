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

  async acceptRequest(requestId: number, userId: number): Promise<MatchRequestWithDetails> {
    await this.matchRequestModel.updateStatus(requestId, 'accepted');
    const updatedRequest = await this.matchRequestModel.findById(requestId);
    if (!updatedRequest) {
      throw new Error('Request not found after update');
    }
    return {
      id: updatedRequest.id,
      mentorId: updatedRequest.mentorId,
      menteeId: updatedRequest.menteeId,
      message: updatedRequest.message,
      status: 'accepted',
      createdAt: updatedRequest.createdAt
    };
  }

  async rejectRequest(requestId: number, userId: number): Promise<MatchRequestWithDetails> {
    await this.matchRequestModel.updateStatus(requestId, 'rejected');
    const updatedRequest = await this.matchRequestModel.findById(requestId);
    if (!updatedRequest) {
      throw new Error('Request not found after update');
    }
    return {
      id: updatedRequest.id,
      mentorId: updatedRequest.mentorId,
      menteeId: updatedRequest.menteeId,
      message: updatedRequest.message,
      status: 'rejected',
      createdAt: updatedRequest.createdAt
    };
  }

  async cancelRequest(requestId: number, userId: number): Promise<MatchRequestWithDetails> {
    const request = await this.matchRequestModel.findById(requestId);
    if (!request) {
      throw new Error('Request not found');
    }
    
    // 상태를 cancelled로 업데이트 (삭제 대신)
    await this.matchRequestModel.updateStatus(requestId, 'cancelled');
    
    return {
      id: request.id,
      mentorId: request.mentorId,
      menteeId: request.menteeId,
      message: request.message,
      status: 'cancelled',
      createdAt: request.createdAt
    };
  }
}
