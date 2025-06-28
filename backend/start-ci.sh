#!/bin/bash

echo "🚀 CI 환경용 백엔드 서버 실행..."

# 환경 변수 설정
export NODE_ENV=production
export PORT=8080
export JWT_SECRET=ci-test-jwt-secret-key-for-lipcoding-2025
export JWT_EXPIRES_IN=1h
export JWT_ISSUER=mentor-mentee-app
export JWT_AUDIENCE=mentor-mentee-users
export DATABASE_PATH=:memory:
export FRONTEND_URL=http://localhost:3000

echo "📦 의존성 설치 중..."
npm ci --production=false

echo "🔨 애플리케이션 빌드 중..."
npm run build

echo "🚀 서버 백그라운드 실행 중..."
# 더 상세한 로깅과 함께 서버 시작
nohup npm start > server.log 2>&1 &

# 서버 PID 저장
SERVER_PID=$!
echo $SERVER_PID > server.pid
echo "서버 PID: $SERVER_PID"

echo "⏳ 서버 시작 대기 중..."
for i in {1..30}; do
  # 프로세스가 살아있는지 먼저 확인
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ 서버 프로세스가 종료되었습니다."
    echo "=== 서버 로그 ==="
    cat server.log
    exit 1
  fi
  
  # swagger-ui 엔드포인트 체크
  if curl -s http://localhost:8080/swagger-ui > /dev/null 2>&1; then
    echo "✅ 서버가 성공적으로 시작되었습니다!"
    
    # 추가 안정성 체크: 몇 초 더 기다린 후 프로세스 상태 재확인
    sleep 3
    if ! kill -0 $SERVER_PID 2>/dev/null; then
      echo "❌ 서버가 시작 직후 종료되었습니다."
      echo "=== 서버 로그 ==="
      cat server.log
      exit 1
    fi
    
    echo "🔍 서버 상태 최종 확인..."
    echo "PID $SERVER_PID 프로세스 상태: $(ps -p $SERVER_PID -o state= 2>/dev/null || echo 'DEAD')"
    exit 0
  fi
  echo "대기 중... ($i/30)"
  sleep 2
done

echo "❌ 서버 시작 실패"
echo "=== 서버 로그 ==="
cat server.log
exit 1
