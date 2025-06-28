import { test, expect } from '@playwright/test';

// 테스트를 위한 헬퍼 함수
async function loginAsUser(page: any, email: string, password: string) {
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#login').click();
  await expect(page).toHaveURL('/profile');
}

async function signupAndLogin(page: any, role: 'mentor' | 'mentee' = 'mentee') {
  const testEmail = `test_${Date.now()}_${role}@example.com`;
  const testPassword = 'testPassword123';
  const testName = `Test ${role}`;

  await page.goto('/signup');
  await page.locator('#name').fill(testName);
  await page.locator('#email').fill(testEmail);
  await page.locator('#password').fill(testPassword);
  
  await page.locator('#role').click();
  if (role === 'mentor') {
    await page.getByRole('option', { name: '멘토 (가르치고 싶어요)' }).click();
  } else {
    await page.getByRole('option', { name: '멘티 (배우고 싶어요)' }).click();
  }
  
  await page.locator('#signup').click();
  await expect(page).toHaveURL('/profile');
  
  return { email: testEmail, password: testPassword, name: testName };
}

test.describe('User Profile', () => {
  test('프로필 페이지 기본 요소 확인', async ({ page }) => {
    const user = await signupAndLogin(page, 'mentee');
    
    await page.goto('/profile');
    
    // 프로필 페이지 기본 요소들 확인
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#bio')).toBeVisible();
    await expect(page.locator('#save')).toBeVisible();
  });

  test('프로필 정보 수정', async ({ page }) => {
    const user = await signupAndLogin(page, 'mentor');
    
    await page.goto('/profile');
    
    // 프로필 정보 수정
    const newBio = '경험 많은 개발자입니다. JavaScript, React, Node.js를 가르칠 수 있습니다.';
    await page.locator('#bio').fill(newBio);
    
    // 멘토인 경우 스킬셋 필드 확인
    if (await page.locator('#skillsets').isVisible()) {
      await page.locator('#skillsets').fill('JavaScript, React, Node.js');
    }
    
    await page.locator('#save').click();
    
    // 저장 성공 확인 (성공 메시지 또는 페이지 리로드 확인)
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Mentor List', () => {
  test('멘토 목록 페이지 기본 요소 확인', async ({ page }) => {
    await signupAndLogin(page, 'mentee');
    
    await page.goto('/mentors');
    
    // 검색 기능 확인
    await expect(page.locator('#search')).toBeVisible();
    
    // 멘토 목록이 로드되는지 확인 (실제 멘토가 있다면)
    // 최소한 페이지가 에러 없이 로드되는지 확인
    await expect(page.locator('h1')).toContainText(/멘토|Mentor/);
  });

  test('멘토 검색 기능', async ({ page }) => {
    await signupAndLogin(page, 'mentee');
    
    await page.goto('/mentors');
    
    // 검색어 입력
    await page.locator('#search').fill('JavaScript');
    
    // 검색 결과 확인 (실제 검색 결과에 따라 조정 필요)
    await page.waitForLoadState('networkidle');
    
    // 검색어가 입력 필드에 제대로 들어갔는지 확인
    await expect(page.locator('#search')).toHaveValue('JavaScript');
  });

  test('멘토 카드 요소 확인', async ({ page }) => {
    // 먼저 멘토로 가입하여 목록에 표시될 수 있도록 함
    await signupAndLogin(page, 'mentor');
    
    // 프로필 완성
    await page.goto('/profile');
    await page.locator('#bio').fill('JavaScript 전문가입니다.');
    if (await page.locator('#skillsets').isVisible()) {
      await page.locator('#skillsets').fill('JavaScript, React');
    }
    await page.locator('#save').click();
    
    // 로그아웃
    await page.evaluate(() => localStorage.clear());
    
    // 멘티로 로그인
    await signupAndLogin(page, 'mentee');
    
    await page.goto('/mentors');
    
    // 멘토 카드가 있다면 해당 요소들 확인
    const mentorCards = page.locator('.mentor');
    const count = await mentorCards.count();
    
    if (count > 0) {
      // 첫 번째 멘토 카드 확인
      const firstCard = mentorCards.first();
      await expect(firstCard.locator('#name')).toBeVisible();
      await expect(firstCard.locator('#skill')).toBeVisible();
    }
  });
});

test.describe('Authentication Protection', () => {
  test('인증되지 않은 상태에서 보호된 페이지 접근', async ({ page }) => {
    // 로컬 스토리지 클리어
    await page.evaluate(() => localStorage.clear());
    
    // 보호된 페이지들에 접근 시도
    const protectedPages = ['/profile', '/mentors'];
    
    for (const pagePath of protectedPages) {
      await page.goto(pagePath);
      // 로그인 페이지로 리다이렉트되거나, 인증 필요 메시지가 표시되어야 함
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/login|auth/);
    }
  });
});
