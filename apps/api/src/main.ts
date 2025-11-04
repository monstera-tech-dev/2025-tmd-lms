import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env 파일 로드 (apps/api/.env)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// 환경 변수 로드 확인 (디버깅용)
console.log('DB 연결 정보:');
console.log('  DB_HOST:', process.env.DB_HOST || 'localhost (기본값)');
console.log('  DB_PORT:', process.env.DB_PORT || '5432 (기본값)');
console.log('  DB_USERNAME:', process.env.DB_USERNAME || 'postgres (기본값)');
console.log('  DB_DATABASE:', process.env.DB_DATABASE || 'lms (기본값)');

async function bootstrap() {
  const expressApp = express();

  // 요청 본문 크기 제한 증가 (50MB)
  expressApp.use(express.json({ limit: '50mb' }));
  expressApp.use(express.urlencoded({ limit: '50mb', extended: true }));

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  // CORS 설정 (환경 변수 또는 기본값)
  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.enableCors({
    origin: allowedOrigin,
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('백엔드 서버가 http://localhost:3000 에서 실행 중입니다.');
}
bootstrap();

