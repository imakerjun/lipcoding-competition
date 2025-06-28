# 멘토-멘티 매칭 앱 개발 체크리스트

## 📋 프로젝트 개요
- **제한시간**: 3시간
- **사용 도구**: VS Code + GitHub Copilot 보이스 코딩
- **기술 스택**: 웹 앱
- **사용 언어**: Python, JavaScript, Java, .NET 중 선택
- **데이터베이스**: 자유 선택 (로컬에서 실행 가능해야 함)

## 🏗️ 프로젝트 구조 설정

### 기본 설정
- [x] 프로젝트 디렉토리 생성
- [x] 프론트엔드 앱 설정 (http://localhost:3000)
- [x] 백엔드 앱 설정 (http://localhost:8080)
- [x] 데이터베이스 설정 및 초기화
- [x] OpenAPI 문서 생성 (openapi.yaml)

## 🔐 인증 시스템

### 회원가입 기능
- [x] `/signup` 엔드포인트 구현
- [x] 이메일, 비밀번호, 이름, 역할(mentor/mentee) 입력 받기
- [ ] 회원가입 후 `/` 페이지로 리다이렉트
- [ ] UI: 이메일 필드 (`id="email"`)
- [ ] UI: 비밀번호 필드 (`id="password"`)
- [ ] UI: 역할 필드 (`id="role"`)
- [ ] UI: 회원가입 버튼 (`id="signup"`)

### 로그인 기능
- [x] `/login` 엔드포인트 구현
- [x] JWT 토큰 발급 (RFC 7519 표준 준수)
- [x] JWT 클레임 포함: `iss`, `sub`, `aud`, `exp`, `nbf`, `iat`, `jti`, `name`, `email`, `role`
- [x] 토큰 유효기간: 1시간
- [ ] 로그인 후 `/profile` 페이지로 리다이렉트
- [ ] UI: 이메일 필드 (`id="email"`)
- [ ] UI: 비밀번호 필드 (`id="password"`)
- [ ] UI: 로그인 버튼 (`id="login"`)

### 인증 상태 관리
- [ ] 인증되지 않은 사용자는 `/login`으로 자동 리다이렉트
- [ ] 인증된 사용자는 `/profile`로 자동 리다이렉트
- [x] `Authorization: Bearer <token>` 헤더 처리

## 👤 사용자 프로필

### 프로필 조회
- [x] `/me` 엔드포인트 구현
- [x] 멘토/멘티 역할별 다른 프로필 정보 반환
- [x] 기본 프로필 이미지 설정
  - 멘토: `https://placehold.co/500x500.jpg?text=MENTOR`
  - 멘티: `https://placehold.co/500x500.jpg?text=MENTEE`

### 프로필 수정
- [x] `/profile` PUT 엔드포인트 구현
- [x] 멘토: 이름, 소개글, 이미지, 기술 스택 수정
- [x] 멘티: 이름, 소개글, 이미지 수정
- [x] 이미지 업로드 기능 (JPG/PNG, 500x500~1000x1000px, 최대 1MB)
- [ ] UI: 이름 필드 (`id="name"`)
- [ ] UI: 소개글 필드 (`id="bio"`)
- [ ] UI: 기술 스택 필드 (`id="skillsets"`) - 멘토만
- [ ] UI: 프로필 사진 (`id="profile-photo"`)
- [ ] UI: 프로필 사진 업로드 필드 (`id="profile"`)
- [ ] UI: 저장 버튼 (`id="save"`)

### 프로필 이미지
- [x] `/images/:role/:id` 엔드포인트 구현
- [x] 이미지 렌더링 기능
- [x] 데이터베이스에 이미지 저장

## 👥 멘토 목록 조회 (멘티 전용)

### 멘토 리스트
- [ ] `/mentors` GET 엔드포인트 구현
- [ ] 전체 멘토 목록 조회
- [ ] UI: 개별 멘토 엘리먼트 (`class="mentor"`)

### 검색 및 필터링
- [ ] 기술 스택별 검색 기능 (`skill` 쿼리 파라미터)
- [ ] 한 번에 하나의 스킬만 검색 가능
- [ ] UI: 스킬셋 검색 필드 (`id="search"`)

### 정렬 기능
- [ ] 이름별 정렬 (`order_by=name`)
- [ ] 기술 스택별 정렬 (`order_by=skill`)
- [ ] 기본값: 멘토 ID 기준 오름차순
- [ ] UI: 이름 정렬 옵션 (`id="name"`)
- [ ] UI: 스킬 정렬 옵션 (`id="skill"`)

### 네비게이션
- [ ] 멘티 역할 사용자 네비게이션: `/profile`, `/mentors`, `/requests`

## 🤝 매칭 요청 시스템

### 매칭 요청 보내기 (멘티 전용)
- [ ] `/match-requests` POST 엔드포인트 구현
- [ ] 멘토 ID, 멘티 ID, 메시지 포함
- [ ] 한 멘토에게 한 번만 요청 가능
- [ ] UI: 요청 메시지 필드 (`id="message"`, `data-mentor-id="{{mentor-id}}"`, `data-testid="message-{{mentor-id}}"`)
- [ ] UI: 요청 버튼 (`id="request"`)

### 매칭 요청 목록 조회

#### 멘토용 - 받은 요청
- [ ] `/match-requests/incoming` GET 엔드포인트 구현
- [ ] 상태별 요청 목록 (pending, accepted, rejected, cancelled)
- [ ] UI: 요청 메시지 (`class="request-message"`, `mentee="{{mentee-id}}"`)
- [ ] UI: 수락 버튼 (`id="accept"`)
- [ ] UI: 거절 버튼 (`id="reject"`)

#### 멘티용 - 보낸 요청
- [ ] `/match-requests/outgoing` GET 엔드포인트 구현
- [ ] 보낸 요청 상태 확인
- [ ] UI: 요청 상태 (`id="request-status"`)

### 매칭 요청 처리 (멘토 전용)
- [ ] `/match-requests/:id/accept` PUT 엔드포인트 구현
- [ ] `/match-requests/:id/reject` PUT 엔드포인트 구현
- [ ] 한 명의 멘티 요청만 수락 가능
- [ ] 수락 시 다른 요청 자동 거절

### 매칭 요청 취소 (멘티 전용)
- [ ] `/match-requests/:id` DELETE 엔드포인트 구현
- [ ] 보낸 요청 취소 기능

## 🛡️ 보안 요구사항

### 기본 보안
- [x] SQL 인젝션 공격 방지
- [ ] XSS 공격 방지
- [ ] OWASP TOP 10 취약점 대응
- [x] 로컬 HTTPS 인증서 사용하지 않음

### JWT 보안
- [x] RFC 7519 표준 준수
- [x] 모든 필수 클레임 포함
- [x] 적절한 만료 시간 설정

## 📚 API 문서화

### OpenAPI 문서
- [ ] OpenAPI 3.0 스펙에 맞는 문서 작성
- [ ] 모든 엔드포인트 명세 포함
- [ ] 요청/응답 스키마 정의
- [ ] 에러 응답 정의

### Swagger UI
- [x] `/openapi.json` 엔드포인트 제공
- [x] `/swagger-ui` 페이지 제공
- [x] 루트 URL에서 Swagger UI로 자동 리다이렉트

## 🗄️ 데이터베이스 설계

### 테이블 구조
- [x] 사용자 테이블 (멘토/멘티 공통)
- [x] 매칭 요청 테이블
- [x] 프로필 이미지 저장 방식 결정

### 데이터베이스 초기화
- [x] 앱 실행 시 자동 테이블 생성
- [x] 필요한 인덱스 생성
- [ ] 초기 데이터 설정 (필요시)

## 🧪 테스트 준비

### 실행 명령어
- [x] 백엔드 실행 명령어 문서화 (예: `npm start`, `fastapi run`, `./mvnw spring-boot:run`)
- [x] 프론트엔드 실행 명령어 문서화
- [x] 데이터베이스 초기화 명령어 문서화

### UI 테스트 요소
- [ ] 모든 필수 HTML ID 속성 설정
- [ ] 모든 필수 CSS 클래스 설정
- [ ] 데이터 속성 설정 (`data-mentor-id`, `data-testid`)

## 🚀 배포 및 실행

### 로컬 실행
- [x] 프론트엔드: http://localhost:3000 접속 가능
- [x] 백엔드: http://localhost:8080 접속 가능
- [x] API: http://localhost:8080/api 접속 가능
- [x] Swagger UI: http://localhost:8080 접속 시 자동 리다이렉트

### 의존성 관리
- [x] 필요한 패키지 설치
- [x] 환경 변수 설정
- [x] 설정 파일 구성

## 📝 최종 검증

### 기능 테스트
- [ ] 회원가입/로그인 플로우 테스트
- [ ] 프로필 등록/수정 테스트
- [ ] 멘토 목록 조회/검색/정렬 테스트
- [ ] 매칭 요청 보내기/받기 테스트
- [ ] 매칭 요청 수락/거절/취소 테스트

### API 테스트
- [ ] 모든 엔드포인트 정상 동작 확인
- [ ] 에러 케이스 처리 확인
- [ ] 인증 토큰 검증 확인

### UI 테스트
- [ ] 모든 페이지 정상 렌더링 확인
- [ ] 반응형 디자인 확인
- [ ] 사용자 경험 개선사항 적용

## ⏰ 시간 관리

### 3시간 제한 시간 내 완료
- [ ] 핵심 기능 우선 구현
- [ ] 기본 UI 완성
- [ ] API 연동 완료
- [ ] 테스트 가능한 상태로 완성

## 🔧 코드 리팩터링 계획

### Phase 1: 아키텍처 개선
- [x] DI 컨테이너 구현 및 적용
- [x] 설정 관리 클래스 생성 (Config)
- [x] 서비스 팩토리 패턴 적용
- [x] 의존성 주입 개선

### Phase 2: 에러 처리 표준화  
- [x] 커스텀 에러 클래스 생성
- [x] 에러 응답 표준화
- [x] 글로벌 에러 핸들러 개선
- [x] 에러 로깅 시스템 추가

### Phase 3: 검증 로직 분리
- [ ] 입력 검증 미들웨어 생성
- [ ] DTO (Data Transfer Object) 클래스 생성
- [ ] 검증 스키마 정의 (Joi/Zod)
- [ ] 라우터에서 비즈니스 로직 분리

### Phase 4: 보안 강화
- [ ] Rate limiting 추가
- [ ] 요청 크기 제한
- [ ] CORS 정책 세분화
- [ ] 보안 헤더 강화

### Phase 5: 테스트 확장
- [ ] API 통합 테스트 추가
- [ ] E2E 테스트 시나리오 작성
- [ ] 테스트 커버리지 측정
- [ ] 성능 테스트 추가

### Phase 6: 코드 품질 개선
- [ ] 코드 중복 제거
- [ ] 함수 복잡도 개선
- [ ] 타입 안전성 강화
- [ ] 코드 문서화 개선

---

**참고 문서:**
- [API 명세서](./mentor-mentee-api-spec.md)
- [앱 요구사항](./mentor-mentee-app-requirements.md)
- [사용자 스토리](./mentor-mentee-app-user-stories.md)
- [평가 기준](./mentor-mentee-app-assessment.md) 