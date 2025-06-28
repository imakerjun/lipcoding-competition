import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import config from './config';
import { authRoutes } from './routes/auth';
import { profileRoutes } from './routes/profile';
import { mentorRoutes } from './routes/mentor';
import { matchRequestRoutes } from './routes/matchRequest';

const app = express();

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger 설정
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '멘토-멘티 매칭 앱 API',
      version: '1.0.0',
      description: '멘토와 멘티를 매칭하는 시스템 API',
    },
    servers: [
      {
        url: 'http://localhost:8080/api',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI 라우트
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// 루트 경로에서 Swagger UI로 리다이렉트
app.get('/', (req, res) => {
  res.redirect('/swagger-ui');
});

// API 라우트
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', mentorRoutes);
app.use('/api', matchRequestRoutes);

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// 에러 핸들러
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

export { app }; 