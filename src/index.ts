import { app } from './app';
import DatabaseService from './database';
import config from './config';

async function startServer() {
  try {
    // 데이터베이스 초기화
    await DatabaseService.initialize();
    console.log('Database initialized successfully');

    // 서버 시작
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Swagger UI: http://localhost:${config.port}/swagger-ui`);
      console.log(`OpenAPI JSON: http://localhost:${config.port}/openapi.json`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await DatabaseService.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await DatabaseService.close();
  process.exit(0);
});

startServer(); 