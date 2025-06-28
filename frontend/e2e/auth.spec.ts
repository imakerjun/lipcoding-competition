import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 백엔드 서버가 실행 중인지 확인
    await page.goto('/');
  });

  test('회원가입 페이지 로드 및 기본 요소 확인', async ({ page }) => {
    await page.goto('/signup');
    
    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();
    
    // 필수 입력 필드 확인
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#role')).toBeVisible();
    await expect(page.locator('#signup')).toBeVisible();
  });

  test('로그인 페이지 로드 및 기본 요소 확인', async ({ page }) => {
    await page.goto('/login');
    
    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
    
    // 필수 입력 필드 확인
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#login')).toBeVisible();
  });

  test('회원가입 후 로그인 플로우', async ({ page }) => {
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'testPassword123';
    const testName = 'Test User';

    // 회원가입
    await page.goto('/signup');
    
    await page.locator('#name').fill(testName);
    await page.locator('#email').fill(testEmail);
    await page.locator('#password').fill(testPassword);
    
    // 역할 선택 (멘티)
    await page.locator('#role').click();
    await page.getByRole('option', { name: '멘티 (배우고 싶어요)' }).click();
    
    await page.locator('#signup').click();
    
    // 프로필 페이지로 리다이렉트 확인
    await expect(page).toHaveURL('/profile');
    
    // 로그아웃 후 로그인 테스트
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.goto('/login');
    
    await page.locator('#email').fill(testEmail);
    await page.locator('#password').fill(testPassword);
    await page.locator('#login').click();
    
    // 다시 프로필 페이지로 리다이렉트 확인
    await expect(page).toHaveURL('/profile');
  });

  test('잘못된 로그인 정보로 에러 메시지 표시', async ({ page }) => {
    await page.goto('/login');
    
    await page.locator('#email').fill('wrong@email.com');
    await page.locator('#password').fill('wrongpassword');
    await page.locator('#login').click();
    
    // 에러 메시지 확인
    await expect(page.locator('text=로그인에 실패했습니다')).toBeVisible();
  });
});

test.describe('Authentication Flow - Extended', () => {
  test.beforeEach(async ({ page }) => {
    // 백엔드 서버가 실행 중인지 확인
    await page.goto('/');
  });

      test('회원가입 페이지 로드 및 기본 요소 확인', async ({ page }) => {
        await page.goto('/signup');
        
        // 페이지 제목 확인
        await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();
        
        // 필수 입력 필드 확인
        await expect(page.locator('#name')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('#role')).toBeVisible();
        await expect(page.locator('#signup')).toBeVisible();
      });

      test('로그인 페이지 로드 및 기본 요소 확인', async ({ page }) => {
        await page.goto('/login');
        
        // 페이지 제목 확인
        await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
        
        // 필수 입력 필드 확인
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('#login')).toBeVisible();
      });

      test('회원가입 후 로그인 플로우 - 멘티', async ({ page }) => {
        const testEmail = `mentee_${Date.now()}@example.com`;
        const testPassword = 'testPassword123';
        const testName = 'Test Mentee';

        // 회원가입
        await page.goto('/signup');
        
        await page.locator('#name').fill(testName);
        await page.locator('#email').fill(testEmail);
        await page.locator('#password').fill(testPassword);
        
        // 역할 선택 (멘티)
        await page.locator('#role').click();
        await page.getByRole('option', { name: '멘티 (배우고 싶어요)' }).click();
        
        await page.locator('#signup').click();
        
        // 프로필 페이지로 리다이렉트 확인
        await expect(page).toHaveURL('/profile');
        
        // 로그아웃 후 로그인 테스트
        await page.evaluate(() => {
          localStorage.clear();
        });
        
        await page.goto('/login');
        
        await page.locator('#email').fill(testEmail);
        await page.locator('#password').fill(testPassword);
        await page.locator('#login').click();
        
        // 다시 프로필 페이지로 리다이렉트 확인
        await expect(page).toHaveURL('/profile');
      });

      test('회원가입 후 로그인 플로우 - 멘토', async ({ page }) => {
        const testEmail = `mentor_${Date.now()}@example.com`;
        const testPassword = 'testPassword123';
        const testName = 'Test Mentor';

        // 회원가입
        await page.goto('/signup');
        
        await page.locator('#name').fill(testName);
        await page.locator('#email').fill(testEmail);
        await page.locator('#password').fill(testPassword);
        
        // 역할 선택 (멘토)
        await page.locator('#role').click();
        await page.getByRole('option', { name: '멘토 (가르치고 싶어요)' }).click();
        
        await page.locator('#signup').click();
        
        // 프로필 페이지로 리다이렉트 확인
        await expect(page).toHaveURL('/profile');
        
        // 사용자 정보가 localStorage에 저장되었는지 확인
        const user = await page.evaluate(() => {
          const userStr = localStorage.getItem('user');
          return userStr ? JSON.parse(userStr) : null;
        });
        expect(user).toBeTruthy();
        expect(user.role).toBe('mentor');
      });

      test('잘못된 로그인 정보로 에러 메시지 표시', async ({ page }) => {
        await page.goto('/login');
        
        await page.locator('#email').fill('wrong@email.com');
        await page.locator('#password').fill('wrongpassword');
        await page.locator('#login').click();
        
        // 에러 메시지 확인
        await expect(page.locator('text=로그인에 실패했습니다')).toBeVisible();
      });

      test('빈 필드로 회원가입 시도 시 유효성 검사', async ({ page }) => {
        await page.goto('/signup');
        
        // 빈 폼으로 회원가입 시도
        await page.locator('#signup').click();
        
        // 브라우저 기본 유효성 검사 메시지 확인
        await expect(page.locator('#name')).toHaveAttribute('required');
        await expect(page.locator('#email')).toHaveAttribute('required');
        await expect(page.locator('#password')).toHaveAttribute('required');
      });

      test('잘못된 이메일 형식으로 회원가입 시도', async ({ page }) => {
        await page.goto('/signup');
        
        await page.locator('#name').fill('Test User');
        await page.locator('#email').fill('invalid-email');
        await page.locator('#password').fill('password123');
        
        await page.locator('#role').click();
        await page.getByRole('option', { name: '멘티 (배우고 싶어요)' }).click();
        
        await page.locator('#signup').click();
        
        // 이메일 유효성 검사 확인 (브라우저 기본 또는 커스텀 메시지)
        const emailInput = page.locator('#email');
        await expect(emailInput).toHaveAttribute('type', 'email');
      });

      test('중복 이메일로 회원가입 시도', async ({ page }) => {
        const testEmail = `duplicate_${Date.now()}@example.com`;
        const testPassword = 'testPassword123';
        const testName = 'Test User';

        // 첫 번째 회원가입
        await page.goto('/signup');
        await page.locator('#name').fill(testName);
        await page.locator('#email').fill(testEmail);
        await page.locator('#password').fill(testPassword);
        await page.locator('#role').click();
        await page.getByRole('option', { name: '멘티 (배우고 싶어요)' }).click();
        await page.locator('#signup').click();
        
        await expect(page).toHaveURL('/profile');
        
        // 로그아웃
        await page.evaluate(() => {
          localStorage.clear();
        });
        
        // 같은 이메일로 다시 회원가입 시도
        await page.goto('/signup');
        await page.locator('#name').fill('Another User');
        await page.locator('#email').fill(testEmail);
        await page.locator('#password').fill('anotherPassword123');
        await page.locator('#role').click();
        await page.getByRole('option', { name: '멘토 (가르치고 싶어요)' }).click();
        await page.locator('#signup').click();
        
        // 에러 메시지 확인
        await expect(page.locator('text=이미 존재하는 이메일입니다')).toBeVisible();
      });

      test('로그인 상태에서 인증이 필요한 페이지 접근', async ({ page }) => {
        const testEmail = `auth_test_${Date.now()}@example.com`;
        const testPassword = 'testPassword123';
        const testName = 'Auth Test User';

        // 회원가입
        await page.goto('/signup');
        await page.locator('#name').fill(testName);
        await page.locator('#email').fill(testEmail);
        await page.locator('#password').fill(testPassword);
        await page.locator('#role').click();
        await page.getByRole('option', { name: '멘티 (배우고 싶어요)' }).click();
        await page.locator('#signup').click();
        
        // 프로필 페이지 접근 확인
        await expect(page).toHaveURL('/profile');
        
        // 멘토 목록 페이지 접근 확인
        await page.goto('/mentors');
        await expect(page).toHaveURL('/mentors');
        
        // 요청 목록 페이지 접근 확인
        await page.goto('/requests');
        await expect(page).toHaveURL('/requests');
      });

      test('비로그인 상태에서 보호된 페이지 접근 시 로그인 페이지로 리다이렉트', async ({ page }) => {
        // localStorage 클리어
        await page.evaluate(() => {
          localStorage.clear();
        });
        
        // 보호된 페이지들에 직접 접근 시도
        const protectedPages = ['/profile', '/mentors', '/requests'];
        
        for (const pagePath of protectedPages) {
          await page.goto(pagePath);
          await expect(page).toHaveURL('/login');
        }
      });

      test('로그아웃 기능 테스트', async ({ page }) => {
        const testEmail = `logout_test_${Date.now()}@example.com`;
        const testPassword = 'testPassword123';
        const testName = 'Logout Test User';

        // 로그인
        await page.goto('/signup');
        await page.locator('#name').fill(testName);
        await page.locator('#email').fill(testEmail);
        await page.locator('#password').fill(testPassword);
        await page.locator('#role').click();
        await page.getByRole('option', { name: '멘티 (배우고 싶어요)' }).click();
        await page.locator('#signup').click();
        
        await expect(page).toHaveURL('/profile');
        
        // 로그아웃 버튼 클릭
        await page.locator('#logout').click();
        
        // 로그인 페이지로 리다이렉트 확인
        await expect(page).toHaveURL('/login');
        
        // localStorage에서 토큰과 사용자 정보 제거 확인
        const token = await page.evaluate(() => localStorage.getItem('token'));
        const user = await page.evaluate(() => localStorage.getItem('user'));
        expect(token).toBeNull();
        expect(user).toBeNull();
      });

      test('토큰 만료 시 자동 로그아웃', async ({ page }) => {
        // 만료된 토큰으로 테스트
        await page.evaluate(() => {
          localStorage.setItem('token', 'expired.jwt.token');
          localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@example.com', role: 'mentee' }));
        });
        
        // 보호된 페이지 접근 시도
        await page.goto('/profile');
        
        // 토큰이 유효하지 않으면 로그인 페이지로 리다이렉트
        await expect(page).toHaveURL('/login');
      });
    });

    test.describe('Navigation', () => {
      test('회원가입과 로그인 페이지 간 이동', async ({ page }) => {
        // 회원가입 페이지에서 로그인 링크 클릭
        await page.goto('/signup');
        await page.getByRole('button', { name: '이미 계정이 있으신가요? 로그인하기' }).click();
        await expect(page).toHaveURL('/login');
        
        // 로그인 페이지에서 회원가입 링크 클릭
        await page.getByRole('button', { name: '계정이 없으신가요? 회원가입하기' }).click();
        await expect(page).toHaveURL('/signup');
      });

      test('네비게이션 메뉴 접근성 테스트', async ({ page }) => {
        const testEmail = `nav_test_${Date.now()}@example.com`;
        const testPassword = 'testPassword123';
        const testName = 'Nav Test User';

        // 로그인
        await page.goto('/signup');
        await page.locator('#name').fill(testName);
        await page.locator('#email').fill(testEmail);
        await page.locator('#password').fill(testPassword);
        await page.locator('#role').click();
        await page.getByRole('option', { name: '멘티 (배우고 싶어요)' }).click();
        await page.locator('#signup').click();
        
        // 네비게이션 메뉴 요소들 확인
        await expect(page.locator('#nav-profile')).toBeVisible();
        await expect(page.locator('#nav-mentors')).toBeVisible();
        await expect(page.locator('#nav-requests')).toBeVisible();
        await expect(page.locator('#logout')).toBeVisible();
      });
    });

    test.describe('Form Validation', () => {
      test('비밀번호 최소 길이 검증', async ({ page }) => {
        await page.goto('/signup');
        
        await page.locator('#name').fill('Test User');
        await page.locator('#email').fill('test@example.com');
        await page.locator('#password').fill('123'); // 너무 짧은 비밀번호
        
        await page.locator('#role').click();
        await page.getByRole('option', { name: '멘티 (배우고 싶어요)' }).click();
        
        await page.locator('#signup').click();
        
        // 비밀번호 길이 에러 메시지 확인
        await expect(page.locator('text=비밀번호는 최소 8자 이상이어야 합니다')).toBeVisible();
      });

      test('이름 필드 유효성 검사', async ({ page }) => {
        await page.goto('/signup');
        
        await page.locator('#name').fill(''); // 빈 이름
        await page.locator('#email').fill('test@example.com');
        await page.locator('#password').fill('testPassword123');
        
        await page.locator('#role').click();
        await page.getByRole('option', { name: '멘티 (배우고 싶어요)' }).click();
        
        await page.locator('#signup').click();
        
        // 이름 필수 입력 메시지 확인
        const nameInput = page.locator('#name');
        await expect(nameInput).toHaveAttribute('required');
      });
    });

    test.describe('Accessibility', () => {
      test('폼 요소들의 접근성 확인', async ({ page }) => {
        await page.goto('/signup');
        
        // 모든 입력 필드에 적절한 label이나 aria-label이 있는지 확인
        await expect(page.locator('label[for="name"]')).toBeVisible();
        await expect(page.locator('label[for="email"]')).toBeVisible();
        await expect(page.locator('label[for="password"]')).toBeVisible();
        await expect(page.locator('label[for="role"]')).toBeVisible();
      });

      test('키보드 네비게이션 테스트', async ({ page }) => {
        await page.goto('/login');
        
        // Tab 키로 순차적으로 포커스 이동 확인
        await page.keyboard.press('Tab');
        await expect(page.locator('#email')).toBeFocused();
        
        await page.keyboard.press('Tab');
        await expect(page.locator('#password')).toBeFocused();
        
        await page.keyboard.press('Tab');
        await expect(page.locator('#login')).toBeFocused();
      });
    });
    await page.locator('#login').click();
    
    // 에러 메시지 확인
    await expect(page.locator('text=로그인에 실패했습니다')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('회원가입과 로그인 페이지 간 이동', async ({ page }) => {
    // 회원가입 페이지에서 로그인 링크 클릭
    await page.goto('/signup');
    await page.getByRole('button', { name: '이미 계정이 있으신가요? 로그인하기' }).click();
    await expect(page).toHaveURL('/login');
    
    // 로그인 페이지에서 회원가입 링크 클릭
    await page.getByRole('button', { name: '계정이 없으신가요? 회원가입하기' }).click();
    await expect(page).toHaveURL('/signup');
  });
});
