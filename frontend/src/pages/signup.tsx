import { useState } from 'react';
import { useRouter } from 'next/router';
import { authService, SignupRequest } from '../services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Signup(): JSX.Element {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupRequest>({
    email: '',
    password: '',
    name: '',
    role: 'mentee',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.signup(formData);
      router.push('/profile');
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (value: 'mentor' | 'mentee') => {
    setFormData(prev => ({
      ...prev,
      role: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">회원가입</CardTitle>
          <CardDescription className="text-center">
            새 계정을 만들어 멘토-멘티 매칭을 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="이름을 입력하세요"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="이메일을 입력하세요"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">역할</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="역할을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mentee">멘티 (배우고 싶어요)</SelectItem>
                  <SelectItem value="mentor">멘토 (가르치고 싶어요)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              id="signup"
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => router.push('/login')}
                className="text-sm"
              >
                이미 계정이 있으신가요? 로그인하기
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
