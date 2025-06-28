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

  test('잘못된 로그인 정보로 에러 메시지 표시', async ({ page }) => {
    await page.goto('/login');
    
    await page.locator('#email').fill('wrong@email.com');
    await page.locator('#password').fill('wrongpassword');
    await page.locator('#login').click();
    
    // 에러 메시지 확인
    await expect(page.locator('text=로그인에 실패했습니다')).toBeVisible();
  });
});
