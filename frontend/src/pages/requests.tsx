import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../services/auth';

interface MatchRequest {
  id: number;
  mentorId: number;
  menteeId: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  mentorName?: string;
  menteeName?: string;
}

const RequestsPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [incomingRequests, setIncomingRequests] = useState<MatchRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadRequests();
    }
  }, [currentUser]);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load current user:', error);
      router.push('/login');
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      
      if (currentUser.role === 'mentor') {
        // 멘토인 경우 받은 요청 목록 조회
        const response = await fetch('/api/match-requests/incoming', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setIncomingRequests(data.success ? data.data : []);
        }
      } else {
        // 멘티인 경우 보낸 요청 목록 조회
        const response = await fetch('/api/match-requests/outgoing', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOutgoingRequests(data.success ? data.data : []);
        }
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      setProcessing(requestId);
      const token = authService.getToken();
      
      const response = await fetch(`/api/match-requests/${requestId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('요청을 수락했습니다!');
        await loadRequests(); // 목록 새로고침
      } else {
        const errorData = await response.json();
        alert(`수락 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('요청 수락 중 오류가 발생했습니다.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      setProcessing(requestId);
      const token = authService.getToken();
      
      const response = await fetch(`/api/match-requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('요청을 거절했습니다.');
        await loadRequests(); // 목록 새로고침
      } else {
        const errorData = await response.json();
        alert(`거절 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('요청 거절 중 오류가 발생했습니다.');
    } finally {
      setProcessing(null);
    }
  };

  const handleCancel = async (requestId: number) => {
    if (!confirm('정말로 요청을 취소하시겠습니까?')) {
      return;
    }

    try {
      setProcessing(requestId);
      const token = authService.getToken();
      
      const response = await fetch(`/api/match-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('요청을 취소했습니다.');
        await loadRequests(); // 목록 새로고침
      } else {
        const errorData = await response.json();
        alert(`취소 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Failed to cancel request:', error);
      alert('요청 취소 중 오류가 발생했습니다.');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '대기중';
      case 'accepted': return '수락됨';
      case 'rejected': return '거절됨';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">요청 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {currentUser?.role === 'mentor' ? '받은 요청' : '보낸 요청'}
            </h1>
            <div className="flex space-x-4">
              <button 
                onClick={() => router.push('/mentors')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                멘토 목록
              </button>
              <button 
                onClick={() => router.push('/profile')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                프로필
              </button>
            </div>
          </div>
          <p className="mt-2 text-gray-600">
            {currentUser?.role === 'mentor' 
              ? '멘티들이 보낸 매칭 요청을 확인하고 관리하세요.' 
              : '멘토에게 보낸 요청 상태를 확인하세요.'}
          </p>
        </div>

        {/* 멘토용: 받은 요청 목록 */}
        {currentUser?.role === 'mentor' && (
          <div className="space-y-4">
            {incomingRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-4h-2M4 9h2m8 0V6m0 7v3" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">받은 요청이 없습니다</h3>
                <p className="text-gray-600">멘티들이 매칭 요청을 보내면 여기에 표시됩니다.</p>
              </div>
            ) : (
              incomingRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {request.menteeName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatDate(request.createdAt)}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">요청 메시지:</h4>
                    <p className="request-message text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {request.message}
                    </p>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        id="accept"
                        data-mentee={request.menteeId.toString()}
                        onClick={() => handleAccept(request.id)}
                        disabled={processing === request.id}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {processing === request.id ? '처리 중...' : '수락'}
                      </button>
                      <button
                        id="reject"
                        data-mentee={request.menteeId.toString()}
                        onClick={() => handleReject(request.id)}
                        disabled={processing === request.id}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {processing === request.id ? '처리 중...' : '거절'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 멘티용: 보낸 요청 목록 */}
        {currentUser?.role === 'mentee' && (
          <div className="space-y-4">
            {outgoingRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">보낸 요청이 없습니다</h3>
                <p className="text-gray-600">멘토에게 매칭 요청을 보내보세요!</p>
                <button 
                  onClick={() => router.push('/mentors')}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  멘토 찾아보기
                </button>
              </div>
            ) : (
              outgoingRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {request.mentorName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatDate(request.createdAt)}
                      </p>
                      <span 
                        id="request-status"
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}
                      >
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">보낸 메시지:</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {request.message}
                    </p>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleCancel(request.id)}
                        disabled={processing === request.id}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {processing === request.id ? '취소 중...' : '요청 취소'}
                      </button>
                    </div>
                  )}

                  {request.status === 'accepted' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 text-sm">
                        🎉 매칭이 성사되었습니다! 멘토와 연락을 취해보세요.
                      </p>
                    </div>
                  )}

                  {request.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm">
                        아쉽게도 이번 요청은 거절되었습니다. 다른 멘토에게 요청해보세요.
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;
