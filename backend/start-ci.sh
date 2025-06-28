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
nohup npm start > server.log 2>&1 &

# 서버 PID 저장
echo $! > server.pid
echo "서버 PID: $(cat server.pid)"

echo "⏳ 서버 시작 대기 중..."
for i in {1..30}; do
  if curl -s http://localhost:8080/swagger-ui > /dev/null 2>&1; then
    echo "✅ 서버가 성공적으로 시작되었습니다!"
    exit 0
  fi
  echo "대기 중... ($i/30)"
  sleep 2
done

echo "❌ 서버 시작 실패"
echo "=== 서버 로그 ==="
cat server.log
exit 1
