import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import mentorRoutes from './routes/mentor';
import matchRequestRoutes from './routes/matchRequest';
import { initDatabase } from './database';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 8080;

// OpenAPI 문서 로드
const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger UI 설정
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/openapi.json', (_req, res) => {
  res.json(swaggerDocument);
});

// 루트 경로에서 Swagger UI로 리다이렉트
app.get('/', (_req, res) => {
  res.redirect('/swagger-ui');
});

// API 라우트
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', mentorRoutes);
app.use('/api', matchRequestRoutes);

// 에러 핸들러
app.use(errorHandler);

// 데이터베이스 초기화 및 서버 시작
const startServer = async (): Promise<void> => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Swagger UI available at http://localhost:${PORT}/swagger-ui`);
      console.log(`📋 OpenAPI spec available at http://localhost:${PORT}/openapi.json`);
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
