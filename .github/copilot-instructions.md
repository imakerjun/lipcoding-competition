# GitHub Copilot Custom Instructions

## 프로젝트 컨텍스트

이 프로젝트는 **천하제일 입코딩 대회 2025**를 위한 멘토-멘티 매칭 앱 개발 프로젝트입니다.

## 항상 참고해야 할 문서들

GitHub Copilot은 코드 작성 및 개발 조언 시 다음 문서들의 내용을 항상 고려해야 합니다:

### 핵심 요구사항 문서
1. **mentor-mentee-app-requirements.md** - 앱 개발 요구사항
2. **mentor-mentee-app-user-stories.md** - 사용자 스토리
3. **mentor-mentee-api-spec.md** - API 명세
4. **development-checklist.md** - 개발 체크리스트
5. **mentor-mentee-app-assessment.md** - 평가 방식

### 대회 규칙 문서
- **policy-rules.md** - 입코딩 규칙
- **policy-penalties.md** - 페널티 규정
- **ghcp.md** - GitHub Copilot 사용법

## 개발 지침

### 기술 스택
- **언어**: TypeScript/JavaScript (Node.js)
- **데이터베이스**: SQLite
- **인증**: JWT 토큰
- **API**: RESTful API with OpenAPI 문서

### 핵심 기능
1. 회원가입/로그인 (멘토/멘티 역할)
2. 사용자 프로필 관리
3. 멘토 목록 조회/검색/정렬
4. 매칭 요청 시스템
5. 요청 수락/거절
6. 요청 목록 관리

### 코딩 스타일
- **TDD 방식** 개발 권장
- **TypeScript** 타입 안전성 준수
- **RESTful API** 설계 원칙 준수
- **보안** 고려사항 (JWT, 해싱, 입력 검증)

### UI/UX 요구사항
- 특정 HTML element ID 값 준수 (테스트 자동화용)
- 반응형 웹 디자인
- 직관적인 사용자 인터페이스

## 주의사항

1. **OpenAPI 문서 우선**: API 설계 시 openapi.yaml 파일을 항상 참조
2. **테스트 가능성**: 모든 UI 요소에 적절한 ID 또는 data-testid 속성 추가
3. **보안**: 비밀번호 해싱, JWT 토큰 검증, SQL 인젝션 방지
4. **에러 처리**: 적절한 HTTP 상태 코드와 에러 메시지 반환
5. **데이터 검증**: 입력 데이터 유효성 검사 필수

## 개발 우선순위

1. 인증 시스템 (회원가입/로그인)
2. 사용자 프로필 관리
3. 멘토 목록 조회
4. 매칭 요청 시스템
5. UI/UX 개선

코드 제안이나 문제 해결 시 위의 요구사항과 맥락을 항상 고려하여 답변해주세요.
