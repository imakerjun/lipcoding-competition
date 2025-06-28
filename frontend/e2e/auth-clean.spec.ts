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
