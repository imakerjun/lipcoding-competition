import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../../services/auth';
import { mentorService } from '../../services/mentor';

interface Mentor {
  id: number;
  name: string;
  bio: string;
  skills: string[];
  profileImage?: string;
  email: string;
}

interface MatchRequestData {
  mentorId: number;
  message: string;
}

const MentorDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (id) {
      loadMentorDetail();
    }
  }, [id]);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load current user:', error);
      router.push('/login');
    }
  };

  const loadMentorDetail = async () => {
    try {
      setLoading(true);
      // 기존 멘토 목록에서 해당 멘토를 찾아서 사용
      const mentorResponse = await mentorService.getMentors();
      const foundMentor = mentorResponse.mentors.find((m: any) => m.id === parseInt(id as string));
      
      if (foundMentor) {
        setMentor(foundMentor);
      } else {
        router.push('/mentors');
      }
    } catch (error) {
      console.error('Failed to load mentor:', error);
      router.push('/mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchRequest = async () => {
    if (!mentor || !message.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }

    try {
      setRequesting(true);

      const requestData: MatchRequestData = {
        mentorId: mentor.id,
        message: message.trim()
      };

      const response = await fetch('/api/match-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        alert('매칭 요청이 성공적으로 전송되었습니다!');
        setMessage('');
        router.push('/requests');
      } else {
        const errorData = await response.json();
        alert(`요청 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Match request failed:', error);
      alert('매칭 요청 중 오류가 발생했습니다.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">멘토 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">멘토를 찾을 수 없습니다</h2>
          <button 
            onClick={() => router.push('/mentors')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            멘토 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 현재 사용자가 멘토인 경우 요청 불가
  const canRequest = currentUser?.role === 'mentee';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <button 
            onClick={() => router.push('/mentors')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            멘토 목록으로 돌아가기
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* 멘토 프로필 섹션 */}
          <div className="p-8">
            <div className="flex items-start space-x-6">
              {/* 프로필 이미지 */}
              <div className="flex-shrink-0">
                {mentor.profileImage ? (
                  <img 
                    src={mentor.profileImage} 
                    alt={mentor.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center border-4 border-gray-200">
                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* 멘토 정보 */}
              <div className="flex-1">
                <h1 id="name" className="text-3xl font-bold text-gray-900 mb-2">{mentor.name}</h1>
                <p className="text-gray-600 mb-4">{mentor.email}</p>
                
                {/* 스킬 태그 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.skills.map((skill, index) => (
                    <span 
                      key={index}
                      id="skill"
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* 자기소개 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">자기소개</h3>
                  <p className="text-gray-700 leading-relaxed">{mentor.bio || '자기소개가 없습니다.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 매칭 요청 섹션 */}
          {canRequest && (
            <div className="border-t border-gray-200 p-8 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900 mb-4">매칭 요청 보내기</h2>
              
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  요청 메시지
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="멘토에게 전달할 메시지를 입력해주세요. 어떤 분야에서 도움을 받고 싶은지, 현재 상황 등을 자세히 적어주시면 좋습니다."
                  disabled={requesting}
                />
              </div>

              <button
                id="request"
                data-mentor-id={mentor.id}
                data-testid="match-request-button"
                onClick={handleMatchRequest}
                disabled={requesting || !message.trim()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {requesting ? '요청 전송 중...' : '매칭 요청 보내기'}
              </button>

              <p className="text-sm text-gray-600 mt-2 text-center">
                요청을 보내면 멘토가 확인 후 수락/거절 여부를 알려드립니다.
              </p>
            </div>
          )}

          {/* 멘토인 경우 안내 메시지 */}
          {!canRequest && currentUser?.role === 'mentor' && (
            <div className="border-t border-gray-200 p-8 bg-yellow-50">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-yellow-800">
                  멘토는 다른 멘토에게 매칭 요청을 보낼 수 없습니다. 멘티 계정으로 로그인해주세요.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDetailPage;
