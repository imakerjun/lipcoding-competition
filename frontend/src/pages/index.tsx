import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    // 인증 상태 확인 후 적절한 페이지로 리다이렉트
    // TODO: 실제 인증 상태 확인 로직 구현
    const isAuthenticated = false; // 임시
    
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          멘토-멘티 매칭 앱
        </h1>
        <p className="text-gray-600">페이지를 로딩 중입니다...</p>
      </div>
    </div>
  );
}
