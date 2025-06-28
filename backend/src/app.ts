import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { createAuthRouter } from './routes/auth';
import userRoutes from './routes/user';
import mentorRoutes from './routes/mentor';
import { createMatchRequestRoutes } from './routes/matchRequest';
import { errorHandler, requestIdMiddleware, notFoundHandler } from './middleware/errorHandler';
import { DIContainer } from './container/DIContainer';

export const createApp = (container: DIContainer) => {
  const app = express();

  // OpenAPI 문서 로드
  const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));

  // 미들웨어 설정
  app.use(requestIdMiddleware);
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // API 문서
  app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/openapi.json', (req, res) => {
    res.json(swaggerDocument);
  });

  // 루트 경로에서 Swagger UI로 리다이렉트
  app.get('/', (req, res) => {
    res.redirect('/swagger-ui');
  });

  // API 라우트
  app.use('/api', createAuthRouter(container));
  app.use('/api', userRoutes);
  app.use('/api', mentorRoutes);
  app.use('/api/match-requests', createMatchRequestRoutes(container));

  // 404 핸들러
  app.use(notFoundHandler);

  // 글로벌 에러 핸들러
  app.use(errorHandler);

  return app;
};
