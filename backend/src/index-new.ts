import { initDatabase } from './database';
import { setupGlobalErrorHandlers } from './middleware/errorHandler';
import { config } from './config/AppConfig';
import { createApp } from './app';

const PORT = config.port;

async function startServer() {
  try {
    // 글로벌 에러 핸들러 설정
    setupGlobalErrorHandlers();

    console.log('🚀 Starting mentor-mentee matching app...');
    
    // 데이터베이스 초기화
    console.log('📊 Initializing database...');
    const container = await initDatabase(config);

    // Express 앱 생성
    const app = createApp(container);

    // 서버 시작
    const server = app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}/swagger-ui`);
      console.log(`🔍 OpenAPI JSON: http://localhost:${PORT}/openapi.json`);
    });

    // 서버 종료 처리
    const shutdown = () => {
      console.log('\n🛑 Shutting down server...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
