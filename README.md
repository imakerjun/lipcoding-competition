# 천하제일 입코딩 대회 2025

<div>
  <p><img src="./images/hero.png" width="500" alt="천하제일입코딩대회 이미지"></p>
  <p style="font-size: 16pt; font-weight: bold;"><strong>제 1회 천하제일 입코딩대회에 오신 것을 환영합니다!</strong></p>
</div>

## 행사 정보

자세한 행사 정보는 [https://lipcoding.kr](https://lipcoding.kr) 페이지를 참고하세요.

## 대회 방식

- 제한시간: 3시간
- 사용 도구: VS Code + GitHub Copilot 보이스 코딩
- 기술 스택: 웹 앱
- 사용 언어: Python 3.12, JavaScript (node.js LTS 22.x), Java 21, .NET 9 중 선택
- 데이터베이스: 메모리 DB 또는 SQLite

## 시간 계획

| 시간          | 내용                              |
|---------------|-----------------------------------|
| 12:00 - 12:30 | 체크인                            |
| 12:30 - 12:35 | 오프닝                            |
| 12:35 - 13:05 | 오프닝 키노트                     |
| 13:05 - 13:20 | GitHub Copilot 사용법 안내        |
| 13:20 - 13:30 | 행사 진행 안내                    |
| 13:30 - 14:00 | 입코딩 전 사전 준비 (키보드 허용) |
| 14:00 - 17:00 | 입코딩                            |
| 17:00 - 17:30 | 본선 진출자 투표                  |
| 17:30 - 18:00 | 시상 및 클로징                    |

## 대회 규칙

- [GitHub Copilot 사용법](./ghcp.md)
- [입코딩 규칙](./policy-rules.md)
- [페널티 규정](./policy-penalties.md)

## 도전 과제

**웹 기반 멘토-멘티 매칭 앱 만들기**

- [요구사항](./mentor-mentee-app-requirements.md)
- [사용자 스토리](./mentor-mentee-app-user-stories.md)
- [API 명세](./mentor-mentee-api-spec.md)
- [OpenAPI 문서](./openapi.yaml)
- [평가 방식](./mentor-mentee-app-assessment.md)

## 앱 제출

<div style="font-size: 16pt; font-weight: bold;"><strong>앱 제출 마감 기한: 2025년 6월 28일 17시</strong></div>

<div>
  <br><a href="../../issues"><img src="images/submit.png" width="150" alt="앱 제출" /></a><br><br>
</div>

앱 개발을 마친 참가자는 [![앱제출](https://img.shields.io/badge/%EC%95%B1%20%EC%A0%9C%EC%B6%9C-2D8655)](../../issues)을 클릭해서 자신이 완성한 앱의 리포지토리와 관련 정보를 등록합니다. 이후 GitHub Actions 워크플로우를 통해 이슈에 등록한 내용을 바탕으로 평가를 진행합니다.

> **참고**: 이 때 최종 제출 시각을 넘겨서 제출한 참가자는 자동으로 탈락합니다. 최종 제출 시각은 **2025년 6월 28일 17시**입니다.

## 본선 진출자 명단

| 이름 | GitHub ID | 리포지토리 주소 | 동영상 주소 | 제출 시각 |
|------|-----------|-----------------|-------------|-----------|

# 멘토-멘티 매칭 앱

TypeScript와 TDD 방식으로 개발된 멘토-멘티 매칭 시스템입니다.

## 🏗️ 프로젝트 구조

```
├── frontend/           # Next.js 프론트엔드 앱
├── backend/           # Express.js 백엔드 API
├── docs/             # 요구사항 및 API 문서
├── openapi.yaml      # OpenAPI 3.0 명세
└── package.json      # 루트 패키지 설정
```

## 🚀 빠른 시작

### 1. 전체 프로젝트 설정
```bash
# 루트에서 모든 의존성 설치
npm run install:all

# 개발 서버 동시 실행 (프론트엔드 + 백엔드)
npm run dev
```

### 2. 개별 실행
```bash
# 백엔드만 실행 (http://localhost:8080)
npm run dev:backend

# 프론트엔드만 실행 (http://localhost:3000)
npm run dev:frontend
```

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
PORT=8080
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1h
DB_FILENAME=./database.sqlite
```

### 3. 개발 서버 실행

```bash
# 개발 모드 (핫 리로드)
npm run dev

# 프로덕션 빌드 후 실행
npm run build
npm start
```

### 4. 테스트 실행

```bash
# 모든 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage
```

## 📁 프로젝트 구조

```
src/
├── config/          # 설정 파일
├── database/        # 데이터베이스 관련
├── routes/          # API 라우트
├── services/        # 비즈니스 로직
├── middleware/      # 미들웨어
├── types/           # 타입 정의
├── utils/           # 유틸리티 함수
├── app.ts           # Express 앱 설정
└── index.ts         # 서버 진입점

tests/               # 테스트 파일들
├── auth.test.ts     # 인증 테스트
├── profile.test.ts  # 프로필 테스트
├── mentor.test.ts   # 멘토 관련 테스트
└── match.test.ts    # 매칭 테스트
```

## 🧪 TDD 개발 가이드

### 1. 테스트 작성

각 기능을 구현하기 전에 먼저 테스트를 작성합니다:

```typescript
// tests/auth.test.ts
describe('Authentication', () => {
  it('should create a new user with valid data', async () => {
    // 테스트 코드 작성
  });
});
```

### 2. 테스트 실행

```bash
npm run test:watch
```

### 3. 구현

테스트가 실패하는 것을 확인한 후, 실제 기능을 구현합니다.

### 4. 리팩토링

테스트가 통과한 후, 코드를 리팩토링하여 개선합니다.

## 🔧 개발 도구

### 코드 품질

```bash
# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix

# 타입 체크
npm run type-check
```

### API 문서

- Swagger UI: http://localhost:8080/swagger-ui
- OpenAPI JSON: http://localhost:8080/openapi.json

## 📋 API 엔드포인트

### 인증
- `POST /api/signup` - 회원가입
- `POST /api/login` - 로그인

### 사용자 프로필
- `GET /api/me` - 내 정보 조회
- `PUT /api/profile` - 프로필 수정
- `GET /api/images/:role/:id` - 프로필 이미지

### 멘토 관리
- `GET /api/mentors` - 멘토 목록 조회

### 매칭 요청
- `POST /api/match-requests` - 매칭 요청 생성
- `GET /api/match-requests/incoming` - 받은 요청 목록
- `GET /api/match-requests/outgoing` - 보낸 요청 목록
- `PUT /api/match-requests/:id/accept` - 요청 수락
- `PUT /api/match-requests/:id/reject` - 요청 거절
- `DELETE /api/match-requests/:id` - 요청 취소

## 🛡️ 보안

- JWT 토큰 기반 인증
- 비밀번호 해시화 (bcrypt)
- SQL 인젝션 방지
- XSS 공격 방지
- Helmet.js를 통한 보안 헤더 설정

## 🗄️ 데이터베이스

SQLite를 사용하며, 앱 실행 시 자동으로 테이블이 생성됩니다:

- `users` - 사용자 정보
- `user_profiles` - 사용자 프로필
- `match_requests` - 매칭 요청

## 📝 개발 체크리스트

자세한 개발 체크리스트는 [docs/development-checklist.md](./docs/development-checklist.md)를 참조하세요.

## 🚀 배포

### 로컬 실행 확인

```bash
# 백엔드 서버 실행
npm run dev

# 브라우저에서 확인
# http://localhost:8080 - Swagger UI
# http://localhost:8080/api - API 엔드포인트
```

### 실행 명령어

```bash
npm run dev
```

## �� 라이선스

MIT License
