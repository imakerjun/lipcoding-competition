# 멘토-멘티 매칭 앱 - 프론트엔드

Next.js와 TypeScript로 구현된 멘토-멘티 매칭 앱의 프론트엔드 웹 애플리케이션입니다.

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

앱은 `http://localhost:3000`에서 실행됩니다.

## 🛠️ 사용 기술

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Form Management**: React Hook Form
- **Validation**: Yup
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Testing**: Jest + Testing Library

## 📁 프로젝트 구조

```
src/
├── app/            # Next.js 13+ App Router 페이지
├── components/     # 재사용 가능한 컴포넌트
├── hooks/          # 커스텀 React Hooks
├── services/       # API 서비스 함수들
├── types/          # TypeScript 타입 정의
├── utils/          # 유틸리티 함수들
└── styles/         # 글로벌 스타일
```

## 🎨 주요 기능

### 인증
- 회원가입 (멘토/멘티 역할 선택)
- 로그인/로그아웃
- JWT 토큰 기반 인증

### 사용자 프로필
- 프로필 정보 등록/수정
- 프로필 이미지 업로드
- 멘토: 기술 스택 관리

### 멘토 매칭 (멘티용)
- 멘토 목록 조회
- 기술 스택으로 멘토 검색
- 이름/스킬 기준 정렬
- 매칭 요청 보내기

### 요청 관리
- 매칭 요청 목록 조회
- 요청 상태 확인 (대기/수락/거절)
- 멘토: 요청 수락/거절
- 멘티: 요청 취소

## 🧪 테스트

```bash
# 모든 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch
```

## 🔧 개발 도구

```bash
# 타입 체크
npm run type-check

# 린팅
npm run lint

# 빌드
npm run build

# 프로덕션 실행
npm start
```

## 🎯 UI/UX 특징

- **반응형 디자인**: 모든 화면 크기에 최적화
- **접근성**: 웹 접근성 표준 준수
- **테스트 친화적**: 모든 상호작용 요소에 적절한 ID/테스트 속성 제공
- **현대적 UI**: Tailwind CSS를 활용한 깔끔한 디자인
