# 멘토-멘티 매칭 앱 - 백엔드

Express.js와 TypeScript로 구현된 멘토-멘티 매칭 앱의 백엔드 API 서버입니다.

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일을 편집하여 환경 변수 설정
```

### 3. 개발 서버 실행
```bash
npm run dev
```

서버는 `http://localhost:8080`에서 실행됩니다.

## 📋 API 문서

- **Swagger UI**: http://localhost:8080/swagger-ui
- **OpenAPI JSON**: http://localhost:8080/openapi.json

## 🛠️ 사용 기술

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite3
- **Authentication**: JWT
- **Validation**: Joi
- **Testing**: Jest + Supertest
- **API Documentation**: Swagger UI

## 📁 프로젝트 구조

```
src/
├── controllers/     # 요청 처리 로직
├── routes/         # API 라우트 정의
├── middleware/     # 미들웨어 함수들
├── models/         # 데이터 모델
├── services/       # 비즈니스 로직
├── database/       # 데이터베이스 설정
├── types/          # TypeScript 타입 정의
├── utils/          # 유틸리티 함수들
└── tests/          # 테스트 파일들
```

## 🧪 테스트

```bash
# 모든 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch

# 테스트 커버리지
npm run test:coverage
```

## 🔧 개발 도구

```bash
# 타입 체크
npm run type-check

# 린팅
npm run lint
npm run lint:fix

# 빌드
npm run build

# 프로덕션 실행
npm start
```
