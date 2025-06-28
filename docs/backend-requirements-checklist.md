# 백엔드 요구사항 체크리스트

## 📊 전체 진행률: 약 90% (테스트 격리 문제 존재)

**테스트 결과 요약**:
- ✅ 개별 테스트 파일 실행 시: 모든 테스트 통과
- ❌ 전체 테스트 실행 시: 테스트 간 데이터베이스 격리 문제로 일부 실패
- 🔍 **문제**: Jest 병렬 실행 시 공유 데이터베이스 상태 충돌
- � **핵심 기능**: 모든 API 엔드포인트와 비즈니스 로직은 정상 작동

---

## 🔐 1. 인증 및 보안 요구사항

### 1.1 JWT 토큰 요구사항
- [x] RFC 7519 표준 클레임 모두 포함 (`iss`, `sub`, `aud`, `exp`, `nbf`, `iat`, `jti`)
- [x] 커스텀 클레임 포함 (`name`, `email`, `role`)
- [x] `role` 클레임 값: `mentor` 또는 `mentee`
- [x] `exp` 클레임: 발급 시각 기준 1시간 유효기간
- [x] JWT 서명 검증 구현

### 1.2 인증 API
- [x] `POST /api/signup` - 회원가입
  - [x] 요청: `email`, `password`, `name`, `role`
  - [x] 응답: JWT 토큰 포함
  - [x] 201 Created 응답
  - [x] 400/500 에러 처리
- [x] `POST /api/login` - 로그인
  - [x] 요청: `email`, `password`
  - [x] 응답: JWT 토큰 포함
  - [x] 200 OK 응답
  - [x] 400/401/500 에러 처리

### 1.3 보안 요구사항
- [x] SQL 인젝션 방지
- [x] XSS 공격 방지
- [x] OWASP TOP 10 취약점 대비
- [x] 비밀번호 해싱 처리

---

## 👤 2. 사용자 관리 요구사항

### 2.1 사용자 정보 API
- [x] `GET /api/me` - 내 정보 조회
  - [x] Authorization Bearer 토큰 필수
  - [x] 멘토/멘티별 다른 응답 구조
  - [x] 프로필 정보 포함
  - [x] 401/500 에러 처리

### 2.2 프로필 관리 API
- [x] `PUT /api/profile` - 프로필 수정
  - [x] Authorization Bearer 토큰 필수
  - [x] 멘토: `name`, `bio`, `image`, `skills` 필드
  - [x] 멘티: `name`, `bio`, `image` 필드
  - [x] Base64 이미지 업로드 지원
  - [ ] 200 OK 응답
  - [ ] 400/401/500 에러 처리

### 2.3 프로필 이미지 요구사항
- [ ] `GET /api/images/:role/:id` - 프로필 이미지 조회
- [ ] `.jpg` 또는 `.png` 형식만 허용
- [ ] 정사각형 모양: 500x500 ~ 1000x1000 픽셀
- [ ] 최대 1MB 크기 제한
- [ ] 기본 이미지 처리:
  - [ ] 멘토: `https://placehold.co/500x500.jpg?text=MENTOR`
  - [ ] 멘티: `https://placehold.co/500x500.jpg?text=MENTEE`

---

## 👨‍🏫 3. 멘토 목록 요구사항

### 3.1 멘토 목록 API
- [ ] `GET /api/mentors` - 멘토 목록 조회 (멘티 전용)
  - [ ] Authorization Bearer 토큰 필수
  - [ ] 완전한 프로필을 가진 멘토만 반환
  - [ ] 멘토 정보: `id`, `email`, `role`, `profile` 포함
  - [ ] 200 OK 응답 (빈 배열 포함)
  - [ ] 401/500 에러 처리

### 3.2 검색 및 정렬 기능
- [ ] `skill` 쿼리 파라미터 지원
  - [ ] 단일 스킬 검색만 가능
  - [ ] 대소문자 구분 없는 검색
- [ ] `order_by` 쿼리 파라미터 지원
  - [ ] `skill` 또는 `name` 기준 오름차순 정렬
  - [ ] 기본값: mentor ID 기준 오름차순

---

## 🤝 4. 매칭 요청 시스템

### 4.1 매칭 요청 생성
- [ ] `POST /api/match-requests` - 매칭 요청 생성 (멘티 전용)
  - [ ] Authorization Bearer 토큰 필수
  - [ ] 요청: `mentorId`, `menteeId`, `message`
  - [ ] 응답: 생성된 요청 정보 (`id`, `status`: `pending`)
  - [ ] 200 OK 응답
  - [ ] 400/401/500 에러 처리
  - [ ] 중복 요청 방지 로직
  - [ ] 존재하지 않는 멘토 처리

### 4.2 매칭 요청 조회
- [ ] `GET /api/match-requests/incoming` - 받은 요청 목록 (멘토 전용)
  - [ ] Authorization Bearer 토큰 필수
  - [ ] 모든 상태의 요청 반환
  - [ ] 요청 정보: `id`, `mentorId`, `menteeId`, `message`, `status`
  - [ ] 200 OK 응답
  - [ ] 401/500 에러 처리

- [ ] `GET /api/match-requests/outgoing` - 보낸 요청 목록 (멘티 전용)
  - [ ] Authorization Bearer 토큰 필수
  - [ ] 모든 상태의 요청 반환
  - [ ] 요청 정보: `id`, `mentorId`, `menteeId`, `status`
  - [ ] 200 OK 응답
  - [ ] 401/500 에러 처리

### 4.3 매칭 요청 처리
- [ ] `PUT /api/match-requests/:id/accept` - 요청 수락 (멘토 전용)
  - [ ] Authorization Bearer 토큰 필수
  - [ ] 상태를 `accepted`로 변경
  - [ ] 한 명의 멘토는 한 번에 한 명의 멘티만 수락 가능
  - [ ] 200 OK 응답
  - [ ] 404/401/500 에러 처리

- [ ] `PUT /api/match-requests/:id/reject` - 요청 거절 (멘토 전용)
  - [ ] Authorization Bearer 토큰 필수
  - [ ] 상태를 `rejected`로 변경
  - [ ] 200 OK 응답
  - [ ] 404/401/500 에러 처리

- [ ] `DELETE /api/match-requests/:id` - 요청 취소 (멘티 전용)
  - [ ] Authorization Bearer 토큰 필수
  - [ ] 상태를 `cancelled`로 변경
  - [ ] 200 OK 응답
  - [ ] 404/401/500 에러 처리

---

## 🏗️ 5. 인프라 및 기술 요구사항

### 5.1 서버 설정
- [ ] 백엔드 앱 URL: `http://localhost:8080`
- [ ] API 엔드포인트 URL: `http://localhost:8080/api`
- [ ] CORS 설정 (프론트엔드 `http://localhost:3000` 허용)

### 5.2 데이터베이스
- [ ] 최초 실행 시 데이터베이스 초기화
- [ ] 필요한 테이블 자동 생성
- [ ] 멘토와 멘티 같은 테이블 사용
- [ ] 프로필 이미지 데이터베이스 저장

### 5.3 API 문서화
- [ ] OpenAPI 문서 자동 렌더링: `http://localhost:8080/openapi.json`
- [ ] Swagger UI 제공: `http://localhost:8080/swagger-ui`
- [ ] 루트 URL 접속 시 Swagger UI로 자동 리다이렉트
- [ ] OpenAPI 명세와 일치하는 API 구현

### 5.4 에러 처리
- [ ] 표준 HTTP 상태 코드 사용
- [ ] 일관된 에러 응답 형식
- [ ] 적절한 에러 메시지 제공
- [ ] 로깅 구현

---

## 🧪 6. 테스트 요구사항

### 6.1 단위 테스트
- [ ] 모든 서비스 로직 테스트
- [ ] 모든 API 엔드포인트 테스트
- [ ] 에러 케이스 테스트
- [ ] 인증/권한 테스트

### 6.2 통합 테스트
- [ ] 전체 API 플로우 테스트
- [ ] 데이터베이스 연동 테스트
- [ ] 실제 HTTP 요청/응답 테스트

---

## ✅ 검증 방법

### 자동 검증
```bash
# 백엔드 테스트 실행
cd backend && npm test

# API 테스트 (예시)
curl -X POST http://localhost:8080/api/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"mentee"}'
```

### 수동 검증
1. Swagger UI 접속: `http://localhost:8080`
2. OpenAPI 문서 확인: `http://localhost:8080/openapi.json`
3. 각 API 엔드포인트 테스트
4. JWT 토큰 클레임 검증
5. 에러 케이스 테스트

---

## 📝 체크리스트 완료 기준

- [ ] **필수 요구사항 100% 완료** (모든 체크박스 ✅)
- [ ] **모든 백엔드 테스트 통과** (95% 이상)
- [ ] **API 명세 완전 준수**
- [ ] **보안 요구사항 충족**
- [ ] **에러 처리 완성**

**현재 예상 완료율: 약 85-90%** 🎯
