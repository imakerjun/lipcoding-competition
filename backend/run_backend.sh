#!/bin/bash

echo "⚙️ 백엔드 앱 실행 중..."

# 환경 변수 파일 생성 (없는 경우)
if [ ! -f .env ]; then
    echo "📝 환경 변수 파일 생성 중..."
    cat > .env << EOF
NODE_ENV=development
PORT=8080
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-lipcoding2025
JWT_EXPIRES_IN=1h
JWT_ISSUER=mentor-mentee-app
JWT_AUDIENCE=mentor-mentee-users
DATABASE_PATH=./database.sqlite
FRONTEND_URL=http://localhost:3000
EOF
fi

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
