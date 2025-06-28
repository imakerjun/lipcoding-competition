import { test, expect } from '@playwright/test';

test.describe('Simple Authentication Tests', () => {
  test('회원가입 페이지 기본 요소 확인', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
    
    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();
    
    // 필수 입력 필드 확인
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#role')).toBeVisible();
    await expect(page.locator('#signup')).toBeVisible();
  });

  test('로그인 페이지 기본 요소 확인', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
    
    // 필수 입력 필드 확인
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#login')).toBeVisible();
  });

  test('간단한 회원가입 시도', async ({ page }) => {
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'testPassword123';
    const testName = 'Test User';

    // 네트워크 요청 로깅
    page.on('request', request => {
      console.log('REQUEST:', request.method(), request.url());
    });
    
    page.on('response', response => {
      console.log('RESPONSE:', response.status(), response.url());
    });

    await page.goto('http://localhost:3000/signup');
    
    // 폼 필드 채우기
    await page.locator('#name').fill(testName);
    await page.locator('#email').fill(testEmail);
    await page.locator('#password').fill(testPassword);
    
    // 키보드로 Escape을 눌러서 열린 드롭다운이 있다면 닫기
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    console.log('About to click signup button...');
    
    // 회원가입 버튼 클릭
    await page.locator('#signup').click();
    
    // 최대 10초까지 기다리며 결과 확인
    await page.waitForTimeout(5000);
    
    // 현재 URL 출력
    const currentUrl = page.url();
    console.log('Current URL after signup:', currentUrl);
    
    // 에러 메시지가 있는지 확인
    const errorElement = page.locator('[class*="destructive"]');
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      console.log('Error message:', errorText);
    }
    
    // localStorage에 토큰이 저장되었는지 확인
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const user = await page.evaluate(() => localStorage.getItem('user'));
    console.log('Token stored:', !!token);
    console.log('User stored:', !!user);
  });
});
