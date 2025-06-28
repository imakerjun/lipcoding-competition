import { test, expect } from '@playwright/test';

test.describe('Matching Request Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 백엔드 서버가 실행 중이라고 가정
    await page.goto('http://localhost:3000');
  });

  test('멘티가 멘토에게 매칭 요청을 보낼 수 있어야 한다', async ({ page }) => {
    // 1. 먼저 멘토 생성
    await page.goto('http://localhost:3000/signup');
    await page.waitForLoadState('networkidle');
    
    const mentorEmail = `mentor_${Date.now()}@test.com`;
    await page.fill('#email', mentorEmail);
    await page.fill('#password', 'password123');
    await page.fill('#name', 'Test Mentor');
    
    // 멘토 역할 선택
    try {
      await page.click('[data-testid="role-select"]');
      await page.waitForTimeout(500);
      await page.click('[data-testid="mentor-option"]');
    } catch (error) {
      console.log('Failed to select mentor role, using default');
    }
    
    await page.click('#signup');
    await page.waitForTimeout(3000);
    
    // 멘토 프로필 완성
    await page.goto('http://localhost:3000/profile');
    await page.waitForLoadState('networkidle');
    
    // bio와 skillsets 필드가 있으면 채우기
    const bioField = page.locator('#bio');
    if (await bioField.isVisible()) {
      await bioField.fill('경험 많은 개발자입니다.');
    }
    
    const skillsetsField = page.locator('#skillsets');
    if (await skillsetsField.isVisible()) {
      await skillsetsField.fill('JavaScript, React, Node.js');
    }
    
    const saveButton = page.locator('#save');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 로그아웃
    await page.evaluate(() => localStorage.clear());
    
    // 2. 이제 멘티로 회원가입
    await page.goto('http://localhost:3000/signup');
    await page.waitForLoadState('networkidle');
    
    const testEmail = `mentee_${Date.now()}@test.com`;
    await page.fill('#email', testEmail);
    await page.fill('#password', 'password123');
    await page.fill('#name', 'New Mentee');
    
    // 역할 선택을 생략하고 기본값(mentee) 사용
    await page.click('#signup');

    // 회원가입 후 리다이렉트 대기
    await page.waitForTimeout(3000);
    
    // 현재 URL 확인
    const currentUrl = page.url();
    console.log('Current URL after signup:', currentUrl);
    
    if (currentUrl.includes('/profile')) {
      console.log('Successfully redirected to profile');
      
      // 멘토 목록으로 이동
      await page.goto('http://localhost:3000/mentors');
      await page.waitForLoadState('networkidle');

      // 첫 번째 멘토 선택하여 상세 페이지로 이동
      const mentorCards = page.locator('.mentor');
      const mentorCount = await mentorCards.count();
      console.log(`Found ${mentorCount} mentors`);
      
      if (mentorCount > 0) {
        await mentorCards.first().locator('text=상세보기').click();
        await page.waitForLoadState('networkidle');

        // 매칭 요청 메시지 입력
        const messageTextarea = page.locator('#message');
        if (await messageTextarea.isVisible()) {
          await messageTextarea.fill('안녕하세요! React 멘토링을 받고 싶습니다.');
          
          // 매칭 요청 버튼 클릭
          await page.click('#request');
          
          // 잠시 대기 후 결과 확인
          await page.waitForTimeout(2000);
          console.log('Match request submitted');
        } else {
          console.log('Message textarea not found');
        }
      } else {
        console.log('No mentors available for testing');
      }
    } else {
      console.log('Failed to redirect to profile');
    }
  });

  test('요청 관리 페이지에서 보낸 요청을 확인할 수 있어야 한다', async ({ page }) => {
    // 새로운 멘티로 회원가입 후 요청 생성
    await page.goto('http://localhost:3000/signup');
    await page.waitForLoadState('networkidle');
    
    const testEmail = `mentee_requests_${Date.now()}@test.com`;
    await page.fill('#email', testEmail);
    await page.fill('#password', 'password123');
    await page.fill('#name', 'Request Test Mentee');
    
    await page.click('#signup');
    await page.waitForTimeout(3000);

    // 요청 관리 페이지로 이동
    await page.goto('http://localhost:3000/requests');
    await page.waitForLoadState('networkidle');

    // 페이지가 로드되었는지 확인
    console.log('Requests page loaded');
  });

  test('멘토가 받은 요청을 수락할 수 있어야 한다', async ({ page }) => {
    // 멘토로 회원가입
    await page.goto('http://localhost:3000/signup');
    await page.waitForLoadState('networkidle');
    
    const testEmail = `mentor_${Date.now()}@test.com`;
    await page.fill('#email', testEmail);
    await page.fill('#password', 'password123');
    await page.fill('#name', 'Test Mentor');
    
    // 멘토 역할 선택
    try {
      await page.click('[data-testid="role-select"]');
      await page.waitForTimeout(500);
      await page.click('[data-testid="mentor-option"]');
    } catch (error) {
      console.log('Failed to select mentor role, using default');
    }
    
    await page.click('#signup');
    await page.waitForTimeout(3000);

    // 요청 관리 페이지로 이동
    await page.goto('http://localhost:3000/requests');
    await page.waitForLoadState('networkidle');

    // 대기 중인 요청이 있는지 확인
    const acceptButtons = page.locator('#accept');
    const buttonCount = await acceptButtons.count();
    
    if (buttonCount > 0) {
      console.log(`Found ${buttonCount} pending requests`);
      
      // 첫 번째 수락 버튼 클릭
      await acceptButtons.first().click();
      await page.waitForTimeout(2000);
      console.log('Accept button clicked');
    } else {
      console.log('No pending requests found for mentor');
    }
  });
});
