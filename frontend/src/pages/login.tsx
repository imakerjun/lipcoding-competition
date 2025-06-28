import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login(): JSX.Element {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 로그인 로직 구현
    console.log('Login attempt:', formData);
    router.push('/profile');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            로그인
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input"
              placeholder="이메일"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div>
            <button
              id="login"
              type="submit"
              className="btn btn-primary w-full"
            >
              로그인
            </button>
          </div>
          <div className="text-center">
            <a
              href="/signup"
              className="text-primary-600 hover:text-primary-500"
            >
              회원가입하기
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
