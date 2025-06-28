#!/bin/bash

echo "🚀 멘토-멘티 매칭 앱 실행 중..."

# 의존성 설치
echo "📦 의존성 설치 중..."
npm run install:all

# 개발 서버 실행
echo "🔥 개발 서버 실행 중..."
npm run dev
