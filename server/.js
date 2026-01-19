require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Swagger 설정
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hybird API',
      version: '1.0.0',
      description: 'Hybird 서비스 백엔드 API 문서'
    },
    servers: [
      { url: `http://localhost:${PORT}` }
    ]
  },
  apis: ['./routes/*.js']
});

// 미들웨어 설정
const defaultOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000'
];

const envOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...defaultOrigins, ...envOrigins];

// 와일드카드 패턴을 정규식으로 변환
const originMatchers = allowedOrigins.map(pattern => {
  if (pattern.includes('*')) {
    // * 를 .* 로 변환하여 정규식 생성
    const regexPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${regexPattern}$`);
  }
  return pattern; // 정확한 문자열
});

app.use(cors({
  origin: (origin, callback) => {
    if (process.env.CORS_ALLOW_ALL === 'true') {
      return callback(null, true);
    }

    if (!origin) {
      return callback(null, true);
    }

    // 패턴 매칭 체크
    const isAllowed = originMatchers.some(matcher => {
      if (typeof matcher === 'string') {
        return matcher === origin;
      }
      return matcher.test(origin); // RegExp
    });

    if (isAllowed) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 라우트 import
const usersRoutes = require('./routes/users');
const recordsRoutes = require('./routes/records');
const aiRoutes = require('./routes/ai');
const communityRoutes = require('./routes/community');
const resumeBaseRoutes = require('./routes/resume-base');
const analyticsRoutes = require('./routes/analytics');
const companyRoutes = require('./routes/companies');

// API 라우트 설정
app.use('/api/users', usersRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/resume-base', resumeBaseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/companies', companyRoutes);

// 기본 경로
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Hybird API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      users: '/api/users',
      records: '/api/records',
      ai: '/api/ai',
      community: '/api/community',
      resumeBase: '/api/resume-base',
      analytics: '/api/analytics'
    }
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '요청한 경로를 찾을 수 없습니다',
    path: req.path
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('❌ 서버 오류:', err);
  res.status(500).json({
    success: false,
    error: '서버 내부 오류가 발생했습니다',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 서버 시작
const startServer = async () => {
  try {
    // 데이터베이스 초기화
    await initDatabase();

    // 서버 시작
    app.listen(PORT, () => {
      console.log('\n🎉 ================================');
      console.log('🚀 Hybird 백엔드 서버 시작!');
      console.log('================================');
      console.log(`📍 포트: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🔧 환경: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  DB: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
      console.log('================================\n');
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

// 예외 처리
process.on('uncaughtException', (error) => {
  console.error('처리되지 않은 예외:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('처리되지 않은 Promise 거부:', error);
  process.exit(1);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM 신호 수신. 서버 종료 중...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n서버를 종료합니다...');
  process.exit(0);
});

startServer();
