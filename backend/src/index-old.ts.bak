import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { createAuthRouter } from './routes/auth';
import userRoutes from './routes/user';
import mentorRoutes from './routes/mentor';
import matchRequestRoutes from './routes/matchRequest';
import { initDatabase, getContainer } from './database';
import { errorHandler, requestIdMiddleware, notFoundHandler, setupGlobalErrorHandlers } from './middleware/errorHandler';
import { config } from './config/AppConfig';
import { createApp } from './app';

const PORT = config.port;

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestIdMiddleware); // 요청 ID 생성

// Swagger UI 설정
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/openapi.json', (_req, res) => {
  res.json(swaggerDocument);
});

// 루트 경로에서 Swagger UI로 리다이렉트
app.get('/', (_req, res) => {
  res.redirect('/swagger-ui');
});

// 데이터베이스 초기화 및 서버 시작
const startServer = async (): Promise<void> => {
  try {
    const container = await initDatabase(config);
    
    // DI 컨테이너를 사용한 API 라우트 설정
    const authRoutes = createAuthRouter(container);
    app.use('/api', authRoutes);
    app.use('/api', userRoutes);
    app.use('/api', mentorRoutes);
    app.use('/api', matchRequestRoutes);
    
    // 404 핸들러 (모든 라우트 이후에 추가)
    app.use('*', (req, res) => {
      const error = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.method} ${req.originalUrl} not found`,
          timestamp: new Date().toISOString(),
          path: req.originalUrl
        },
        requestId: req.headers['x-request-id'] || 'unknown'
      };
      res.status(404).json(error);
    });
    
    // 에러 핸들러
    app.use(errorHandler);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Swagger UI available at http://localhost:${PORT}/swagger-ui`);
      console.log(`📋 OpenAPI spec available at http://localhost:${PORT}/openapi.json`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export default app;
