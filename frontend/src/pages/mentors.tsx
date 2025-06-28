import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../services/auth';
import { mentorService, Mentor, MentorSearchParams } from '../services/mentor';

export default function Mentors(): JSX.Element {
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [searchParams, setSearchParams] = useState<MentorSearchParams>({
    search: '',
    sortBy: 'name',
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    loadMentors();
  }, [router, searchParams]);

  const loadMentors = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await mentorService.getMentors(searchParams);
      setMentors(response.mentors);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      console.error('Failed to load mentors:', error);
      setError('멘토 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({
      ...prev,
      search: e.target.value,
      page: 1, // 검색 시 첫 페이지로 이동
    }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams(prev => ({
      ...prev,
      sortBy: e.target.value as 'name' | 'newest' | 'oldest',
      page: 1, // 정렬 변경 시 첫 페이지로 이동
    }));
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">멘토 목록</h1>
          <div className="flex space-x-4">
            <a
              href="/requests"
              className="btn btn-secondary"
            >
              요청 관리
            </a>
            <a
              href="/profile"
              className="btn btn-secondary"
            >
              프로필
            </a>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 검색 및 정렬 */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                검색
              </label>
              <input
                id="search"
                name="search"
                type="text"
                className="input"
                placeholder="멘토 이름이나 소개글로 검색..."
                value={searchParams.search}
                onChange={handleSearchChange}
              />
            </div>
            <div className="w-full sm:w-48">
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
                정렬
              </label>
              <select
                id="sortBy"
                name="sortBy"
                className="input"
                value={searchParams.sortBy}
                onChange={handleSortChange}
              >
                <option value="name">이름순</option>
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 멘토 목록 */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">멘토 목록을 불러오는 중...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              총 {total}명의 멘토가 있습니다.
            </div>

            {mentors.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-gray-600">등록된 멘토가 없습니다.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mentors.map((mentor) => (
                  <div key={mentor.id} className="mentor card">
                    <h3 id="name" className="text-lg font-semibold text-gray-900 mb-2">
                      {mentor.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {mentor.bio || '자기소개가 없습니다.'}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        className="btn btn-secondary flex-1"
                        onClick={() => router.push(`/mentors/${mentor.id}`)}
                      >
                        상세보기
                      </button>
                      <button
                        id={`request-mentor-${mentor.id}`}
                        className="btn btn-primary flex-1"
                        onClick={() => router.push(`/mentors/${mentor.id}`)}
                      >
                        매칭 요청
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(searchParams.page! - 1)}
                    disabled={searchParams.page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium border rounded-md ${
                        pageNum === searchParams.page
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(searchParams.page! + 1)}
                    disabled={searchParams.page === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
