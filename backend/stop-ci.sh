#!/bin/bash

echo "🛑 CI 환경용 백엔드 서버 종료..."

if [ -f server.pid ]; then
  PID=$(cat server.pid)
  echo "서버 PID: $PID"
  
  if kill -0 $PID 2>/dev/null; then
    echo "서버 종료 중..."
    kill $PID
    sleep 2
    
    # 강제 종료가 필요한 경우
    if kill -0 $PID 2>/dev/null; then
      echo "강제 종료 중..."
      kill -9 $PID
    fi
    
    echo "✅ 서버가 종료되었습니다."
  else
    echo "⚠️ 서버가 이미 종료되어 있습니다."
  fi
  
  rm -f server.pid
else
  echo "⚠️ server.pid 파일을 찾을 수 없습니다."
fi

# 포트 8080을 사용하는 모든 프로세스 종료 (백업)
echo "🔍 포트 8080 사용 프로세스 확인..."
lsof -ti:8080 | xargs kill -9 2>/dev/null || echo "포트 8080을 사용하는 프로세스가 없습니다."

echo "🧹 임시 파일 정리..."
rm -f server.log nohup.out

echo "✅ 정리 완료"
